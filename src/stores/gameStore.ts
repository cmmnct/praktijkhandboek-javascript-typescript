import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { cardService } from '@/services/cardService';
import { db, storage, auth } from '@/firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { State, Result, UserCredentials } from '@/models/models';
import { uploadBytes, getDownloadURL, ref as firebaseStorageRef } from 'firebase/storage';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { useNotificationStore } from './notificationStore'; // Importeer de notificationStore



export const useGameStore = defineStore('gameStore', () => {
  const state = reactive<State>({
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    attempts: 0,
    gridSize: 16,
    cards: [],
    results: [],
    stateLoaded: false,
  });
  const notificationStore = useNotificationStore(); // Initialiseer de notificationStore

  const user = ref(auth.currentUser);
  const userCredentials = reactive<UserCredentials>({
    displayName: '',
    oldPassword: '',
    newPassword: '',
    birthdate: '',
    avatarUrl: '',
  });
  const defaultBirthdate = new Date().toISOString().substring(0, 10);
  type Action = 'login' | 'signup' | 'logout' | 'authChange';

  const handleAuthentication = async (action: Action, email?: string, password?: string, currentUser?: any): Promise<boolean> => {
    try {
      const userCredential = await (async () => {
        switch (action) {
          case 'login':
            return await signInWithEmailAndPassword(auth, email!, password!);

          case 'signup':
            return await createUserWithEmailAndPassword(auth, email!, password!);

          case 'logout':
            await auth.signOut();
            return null; // Bij uitloggen is er geen gebruiker, dus return null

          case 'authChange':
            return currentUser ? { user: currentUser } : null; // Simuleer een userCredential als er een currentUser is

          default:
            throw new Error('Invalid auth action');
        }
      })(); // Sluit de IIFE (Immediately Invoked Function Expression)

      const user = userCredential?.user || null;

      if (user) {
        user.value = user;
        await loadUserProfile();
        await loadState();
      } else {
        // user.value = null;
        resetState();
        state.stateLoaded = false;
      }

      return true;
    } catch (error) {
      console.error(`Authentication action "${action}" failed`, error);
      return false;
    }
  };

  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      handleAuthentication('authChange', undefined, undefined, currentUser);
    } else {
      console.log('Geen ingelogde gebruiker.');
      // Andere logica wanneer er geen ingelogde gebruiker is
    }
  });

  const loadUserProfile = async () => {
    if (!auth.currentUser) {
      notificationStore.addNotification('Er is een fout opgetreden bij het laden van uw gegevens.', 'danger');
      return;
    }
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
      notificationStore.addNotification('Uw gegevens met succes geladen.', 'success');
    } else {
      console.log('User document does not exist, creating a new one.');
      notificationStore.addNotification('Geen gebruikersgegevens gevonden, nieuwe aangemaakt.', 'warning');
      const defaultData = {
        displayName: auth.currentUser.displayName || '',
        birthdate: defaultBirthdate,
        avatarUrl: '',
      };
      await setDoc(userDocRef, defaultData);
      setUserProfile(defaultData);
    }

    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
  };

  const setUserProfile = (data: any) => {
    userCredentials.displayName = data?.displayName || '';
    userCredentials.birthdate = data?.birthdate || defaultBirthdate;
    userCredentials.avatarUrl = data?.avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  };

  const updateUserProfile = async (
    updatedCredentials: UserCredentials,
    avatarFile?: File
  ): Promise<boolean> => {
    // early return als de gebruiker niet ingelogd blijkt te zijn
    if (!auth.currentUser) {
      console.error("No current user found.");
      return false;
    }

    try {
      // Reauthenticate and update password if needed
      if (shouldReauthenticate(updatedCredentials)) {
        console.log(shouldReauthenticate(updatedCredentials))
        await reauthenticateAndChangePassword(updatedCredentials);
        return true;
      }
      else {
        // Upload avatar if provided and get the new URL
        const avatarUrl = avatarFile
          ? await uploadAvatar(auth.currentUser.uid, avatarFile)
          : updatedCredentials.avatarUrl;

        // Update Firestore with the new profile data
        await updateFirestoreProfile({
          displayName: updatedCredentials.displayName,
          birthdate: updatedCredentials.birthdate,
          avatarUrl,
        });
        notificationStore.addNotification('uw gegevens zijn met succes aangepast...', 'success');
        // Reload the user profile to reflect the changes in the state
        await loadUserProfile();
        return true;
      }

    } catch (error) {
      notificationStore.addNotification('Er is een fout opgetreden bij het updaten van uw gegevens.', 'error');
      return false;
    }
  };

  const shouldReauthenticate = (credentials: UserCredentials): boolean => {
    return (
      credentials.oldPassword &&
      credentials.newPassword &&
      credentials.oldPassword !== credentials.newPassword
    ) as boolean;
  };

  const reauthenticateAndChangePassword = async (
    credentials: UserCredentials
  ): Promise<void> => {
    console.log('update password started')
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser!.email!,
        credentials.oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await firebaseUpdatePassword(auth.currentUser!, credentials.newPassword);
      notificationStore.addNotification('Wachtwoord met succes bijgewerkt!', 'success');
    } catch (error) {
      notificationStore.addNotification('Onjuist wachtwoord opgegeven.', 'danger');
    }
  };

  const uploadAvatar = async (uid: string, file: File): Promise<string> => {
    try {
      const avatarStorageRef = firebaseStorageRef(storage, `avatars/${uid}`);
      await uploadBytes(avatarStorageRef, file);
      notificationStore.addNotification('Avatar succesvol bijgewerkt!', 'success');
      return await getDownloadURL(avatarStorageRef);
    } catch (error) {
      notificationStore.addNotification('Er ging iets fout bij het updaten van uw avatar. Prober het opnieuw.', 'error');
      throw error;
    }
  };

  const updateFirestoreProfile = async (
    updates: Partial<UserCredentials>
  ): Promise<void> => {
    const userDocRef = doc(db, "users", auth.currentUser!.uid);
    await updateDoc(userDocRef, updates);
  };

  const initializeCards = async (gridSize: number) => {
    if (state.stateLoaded && state.cards.length && state.gridSize === gridSize) return;
    state.cards = await cardService.initializeCards(gridSize);
    state.gridSize = gridSize;
    state.attempts = 0;
    state.lockBoard = false;
    state.firstCard = null;
    state.secondCard = null;
    await saveState();
  };

  const handleCardClick = (index: number) => {
    const clickedCard = state.cards[index];
    if (state.lockBoard || clickedCard === state.firstCard || clickedCard.exposed) return;

    clickedCard.exposed = true;

    if (!state.firstCard) {
      state.firstCard = clickedCard;
      saveState();
      return;
    }

    state.secondCard = clickedCard;
    state.attempts++;
    state.lockBoard = true;

    if (state.firstCard.set === state.secondCard.set) {
      if (!state.cards.some(card => !card.exposed)) {
        setTimeout(() => {
          alert('Gefeliciteerd! Je hebt alle kaarten gevonden.');
          addResult();
        }, 1000);
      }
      resetState();
    } else {
      setTimeout(() => {
        state.firstCard!.exposed = false;
        state.secondCard!.exposed = false;
        resetState();
      }, 1000);
    }
    saveState();
  };

  const resetState = () => {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
    saveState();
  };

  const addResult = () => {
    const result: Result = {
      date: new Date().toISOString(),
      attempts: state.attempts,
      gridSize: state.gridSize,
      score: Math.max(0, state.gridSize * 2 - state.attempts),
    };
    state.results.push(result);
    saveState();
  };

  const saveState = async () => {
    if (auth.currentUser) {
      const userDoc = doc(db, `users/${auth.currentUser.uid}/gameState/state`);
      await setDoc(userDoc, state, { merge: true });
    } else {
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  };

  const loadState = async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, `users/${auth.currentUser.uid}/gameState/state`);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        Object.assign(state, docSnap.data());
      } else {
        await initializeCards(state.gridSize);
        await saveState();
      }
    } else {
      notificationStore.addNotification('Geen netwerk, gegevens uit de localstorage gehaald.', 'warning');
      const savedState = localStorage.getItem('gameState');
      
      if (savedState) {
        Object.assign(state, JSON.parse(savedState));
      } else {
        await initializeCards(state.gridSize);
        saveState();
      }
    }
    state.stateLoaded = true;
  };

  const fetchResults = async () => {
    if (auth.currentUser) {
      const userDoc = doc(db, `users/${auth.currentUser.uid}/gameState/state`);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        state.results = docSnap.data().results;
      }
    }
  };

  return {
    state,
    initializeCards,
    handleCardClick,
    resetState,
    addResult,
    saveState,
    loadState,
    fetchResults,
    updateUserProfile,
    user,
    userCredentials,
    loadUserProfile,
    handleAuthentication
  };
});
