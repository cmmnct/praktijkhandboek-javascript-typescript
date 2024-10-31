import { defineStore } from 'pinia';
import { ref, reactive, watch } from 'vue';
import { doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, collection, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { User, MultiplayerInvitation, MultiPlayerState } from '@/models/models';
import { useNotificationStore } from './notificationStore'; // Zorg dat je de notification store importeert


export const useMultiplayerStore = defineStore('multiplayerStore', () => {
  const currentUser = ref<User | null>(auth.currentUser);
  const invitations = ref<MultiplayerInvitation[]>([]);
  const searchResults = ref<User[]>([]);
  const searchTerm = ref<string>('');

  const fetchUser = async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  };

  // Functie om gebruikers te zoeken
  async function searchUsers(term: string): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(
        query(usersRef, where('displayName', '>=', term), where('displayName', '<=', term + '\uf8ff'))
      );
  
      searchResults.value = querySnapshot.docs
  .map(doc => {
    const userData = doc.data();
    return {
      uid: doc.id, // Haal het uid uit het document-ID
      displayName: userData.displayName || '',
      email: userData.email || null,
      avatarUrl: userData.avatarUrl || null,
    };
  })
  .filter(user => user.uid !== currentUser.value?.uid); // Filter jezelf uit de resultaten
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  // Watch voor zoektermen updates vanuit het component
  watch(searchTerm, (newTerm) => {
    searchUsers(newTerm);
  });

  //zenden en ontvangen van notificaties -------------------------------------------------------

  const notificationStore = useNotificationStore();

  const sendInvitation = async (inviteeId: string) => {
    const inviter = currentUser.value;
    if (!inviter) return;
  
    const invitationData = {
      inviter: { uid: inviter.uid, displayName: inviter.displayName }, // Bewaar zowel uid als displayName
      invitee: { uid: inviteeId, displayName: await fetchDisplayName(inviteeId) }, // Bewaar zowel uid als displayName van invitee
      status: 'pending',
    };
  
    await addDoc(collection(db, 'invitations'), invitationData);
  };
  
  const fetchInvitations = async () => {
    const inviteCollection = collection(db, 'invitations');
    const snapshot = await getDocs(inviteCollection);
    invitations.value = snapshot.docs.map(doc => doc.data() as MultiplayerInvitation);
  };

  const updateInvitationStatus = async (invitationId: string, status: string) => {
    await updateDoc(doc(db, 'invitations', invitationId), { status });
  };

  const listenForInvitations = () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const invitationsRef = collection(db, 'invitations');
  
    // Luister naar inkomende uitnodigingen
    const incomingQuery = query(invitationsRef, where('invitee.uid', '==', user.uid));
    onSnapshot(incomingQuery, (snapshot) => {
      const incomingInvitations = snapshot.docs
        .map((doc): MultiplayerInvitation | null => {
          const data = doc.data();
          const inviter = data.inviter || { uid: '', displayName: 'Unknown' };
          const invitee = data.invitee || { uid: '', displayName: 'Unknown' };
  
          // Voeg alleen geldige uitnodigingen toe
        const newInvitation = new MultiplayerInvitation({ id: doc.id, inviter, invitee, ...data, direction: 'incoming' });
        
        // Notificatie voor inkomende uitnodiging
        if (data.status === 'pending') {
          notificationStore.addNotification(`${inviter.displayName} heeft je uitgenodigd voor een spel!`, 'success');
        }

        return newInvitation;
        })
        .filter(Boolean) as MultiplayerInvitation[]; // Casten na filteren van null-waarden
  
      invitations.value = [...invitations.value.filter(i => i.direction === 'outgoing'), ...incomingInvitations];
    });
  
    // Luister naar uitgaande uitnodigingen
    const outgoingQuery = query(invitationsRef, where('inviter.uid', '==', user.uid));
    onSnapshot(outgoingQuery, (snapshot) => {
      const outgoingInvitations = snapshot.docs
        .map((doc): MultiplayerInvitation | null => {
          const data = doc.data();
          const inviter = data.inviter || { uid: '', displayName: 'Unknown' };
          const invitee = data.invitee || { uid: '', displayName: 'Unknown' };
  
          // Als de uitnodiging is afgewezen, haal deze uit de lijst
          if (data.status === 'declined') {
            notificationStore.addNotification(`${invitee.displayName} heeft je uitnodiging afgewezen.`, 'danger');
            return null; // Retourneer null om te filteren
          }
  
          return new MultiplayerInvitation({ id: doc.id, inviter, invitee, ...data, direction: 'outgoing' });
        })
        .filter(Boolean) as MultiplayerInvitation[]; // Casten na filteren van null-waarden
  
      invitations.value = [...invitations.value.filter(i => i.direction === 'incoming'), ...outgoingInvitations];
    });
  };
  // Start de listener
  listenForInvitations();

  const fetchAllInvitations = async () => {
    const user = auth.currentUser;
    if (!user) return [];
  
    // Query voor uitnodigingen waar de gebruiker de ontvanger is
    const incomingQuery = query(collection(db, 'invitations'), where('invitee.uid', '==', user.uid));
  
    // Query voor uitnodigingen waar de gebruiker de verzender is
    const outgoingQuery = query(collection(db, 'invitations'), where('inviter.uid', '==', user.uid));
  
    // Voer beide queries tegelijk uit
    const [incomingSnapshot, outgoingSnapshot] = await Promise.all([getDocs(incomingQuery), getDocs(outgoingQuery)]);
  
    // Verwerk de resultaten, inclusief inviter en invitee als objecten
    const invitationsWithDisplayNames = [
      ...incomingSnapshot.docs.map((doc) => {
        const data = doc.data();
        const inviter = data.inviter || { uid: '', displayName: 'Unknown' };
        const invitee = data.invitee || { uid: '', displayName: 'Unknown' };
        console.log(`Incoming invitation from ${inviter.displayName} for invitee ${invitee.displayName}`);
        return new MultiplayerInvitation({ id: doc.id, inviter, invitee, ...data, direction: 'incoming' });
      }),
      ...outgoingSnapshot.docs.map((doc) => {
        const data = doc.data();
        const inviter = data.inviter || { uid: '', displayName: 'Unknown' };
        const invitee = data.invitee || { uid: '', displayName: 'Unknown' };
        console.log(`Outgoing invitation to ${invitee.displayName} from inviter ${inviter.displayName}`);
        return new MultiplayerInvitation({ id: doc.id, inviter, invitee, ...data, direction: 'outgoing' });
      }),
    ];
  
    console.log('Invitations with display names:', invitationsWithDisplayNames);
  
    invitations.value = invitationsWithDisplayNames as MultiplayerInvitation[];
  };
  

  // accepteren, annuleren en afwijzen van uitnodigingen--------------------------------------------------------------------

  const acceptInvitation = async (invitationId: string): Promise<string | null> => {
    try {
      // Update de uitnodiging naar 'accepted'
      await updateDoc(doc(db, 'invitations', invitationId), { status: 'accepted' });
  
      notificationStore.addNotification('Uitnodiging aangenomen! Spel gestart.', 'success');
  
      // Geef het gameId (in dit geval invitationId) terug zodat de component hiermee kan werken
      return invitationId;
  
    } catch (error) {
      console.error('Error bij het accepteren van de uitnodiging:', error);
      notificationStore.addNotification('Kon de uitnodiging niet accepteren', 'danger');
      return null;
    }
  };
  
  
  const startGame = async (invitationId: string) => {
    try {
      const newGameState: MultiPlayerState = {
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        cards: [],  // Hier stel je de kaarten in
        stateLoaded: false,
        currentPlayer: 0,  // Start met speler 1
        cardsPlayer1: [],
        cardsPlayer2: []
      };
  
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'active',
        gameState: newGameState
      });
  
      notificationStore.addNotification('Het spel is gestart!', 'success');
    } catch (error) {
      console.error('Error bij het starten van het spel:', error);
      notificationStore.addNotification('Kon het spel niet starten.', 'danger');
    }
  };
  
  const cancelInvitation = async (invitationId: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', invitationId));
      notificationStore.addNotification('Uitnodiging geannuleerd.', 'warning');
    } catch (error) {
      console.error('Error bij het annuleren van de uitnodiging:', error);
      notificationStore.addNotification('Kon de uitnodiging niet annuleren.', 'danger');
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), { status: 'declined' });
      notificationStore.addNotification('Uitnodiging afgewezen.', 'warning');
      // Verwijder de uitnodiging uit de lijst
      invitations.value = invitations.value.filter(invitation => invitation.id !== invitationId);
    } catch (error) {
      console.error('Error bij het afwijzen van de uitnodiging:', error);
      notificationStore.addNotification('Kon de uitnodiging niet afwijzen.', 'danger');
    }
  };
  
  //multiplayer logica ---------------------------------------------------------------------

  const setStatusWaiting = async (invitationId: string) => {
    try {
      const newGameState: MultiPlayerState = {
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        cards: [],  // Voeg gedeelde kaarten toe
        stateLoaded: false,
        currentPlayer: 0,
        cardsPlayer1: [],
        cardsPlayer2: [],
      };
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'waiting',
        gameState: newGameState,
      });
      notificationStore.addNotification('Tegenspeler wacht op het spel. Game state aangemaakt.', 'success');
    } catch (error) {
      console.error('Error bij het instellen van de wachttijd:', error);
    }
  };

const getMultiPlayerState = (invitationId: string): MultiPlayerState | null => {
  const currentInvitation = invitations.value.find(invitation => invitation.id === invitationId);
  return currentInvitation ? currentInvitation.gameState : null;
};


const gameStartedCallback = ref<null | (() => void)>(null); // Hier slaan we de callback op

// Functie om de callback te registreren vanuit de GameStore
const onGameStarted = (callback: () => void) => {
  gameStartedCallback.value = callback;
};

// Luisteren naar status updates
const listenForStatusUpdates = (invitationId: string) => {
  const invitationRef = doc(db, 'invitations', invitationId);

  onSnapshot(invitationRef, (docSnap) => {
    const invitationData = docSnap.data();
    if (!invitationData) return;

    const newStatus = invitationData.status;
    const gameState = invitationData.gameState;

    if (newStatus === 'waiting') {
      notificationStore.addNotification('Wachten op de uitnodiger om het spel te starten...', 'info');
    }

    if (newStatus === 'active' && gameState) {
      notificationStore.addNotification('Het spel is gestart!', 'success');
      // In plaats van direct de GameStore te updaten, roep je de callback aan
      if (gameStartedCallback.value) {
        gameStartedCallback.value(); // Roep de callback aan in de GameStore
      }
    }
  });
};

const listenForInvitationUpdates = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (!user) {
      reject('User is not authenticated');
      return;
    }

    const q = query(
      collection(db, 'invitations'),
      where('inviter.uid', '==', user.uid),
      where('status', '==', 'accepted') // Je luistert naar geaccepteerde uitnodigingen
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.status === 'accepted') {
            console.log(`Invitation ${change.doc.id} is accepted`);
            resolve(change.doc.id); // Retourneer de invitationId
          }
        }
      });
    });

    // Voeg een fallback toe om problemen met timing te voorkomen
    setTimeout(() => {
      unsubscribe();
      reject('No invitation accepted within timeout');
    }, 10000); // Timeout van 10 seconden
  });
};




  //helper functies -----------------------------------------------------------------------

  const fetchDisplayName = async (uid: string): Promise<string | null> => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`User data for ${uid}:`, userData); // Debugging
      return userData.displayName || null;
    }
    console.log(`No user found for ${uid}`); // Debugging
    return null;
  };
  
  
  return {
    currentUser,
    invitations,
    listenForInvitations,
    searchResults,
    searchTerm,
    searchUsers,
    fetchUser,
    sendInvitation,
    fetchAllInvitations,
    updateInvitationStatus,
    cancelInvitation,
    declineInvitation,
    acceptInvitation,
    setStatusWaiting,  
    startGame,
    onGameStarted,
    listenForStatusUpdates, 
    listenForInvitationUpdates,
    getMultiPlayerState,
  };
});
