import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { cardService } from '@/services/cardService';
import { db, auth } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { State, Result, UserCredentials } from '@/models/models';
 
// de functie useGameStore stelt de store aan de hele applicatie beschikbaar. alle eigenschappen die we nodig hebben in de componenten en de staat. Dit volgt overigens ook het singleton design pattern

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

// de gegevens van de gebruiker halen we uit het auth object van Firebase en het object userCredentials wordt een reactief object voor later gebruik in de user settings. Hiervoor hebben we o.a. ook een datum in het juiste format voor nodig (defaultBirthdate).


  const user = ref(auth.currentUser);
  const userCredentials = reactive<UserCredentials>({
    displayName: '',
    password: '',
    birthdate: '',
    avatarUrl: '',
  });
  const defaultBirthdate = new Date().toISOString().substring(0, 10);

// handleAuthentication is de centrale functie die alle taken rond authenticatie afhandelt zoals inloggen, uitloggen, aanmelden, zelfs als er om wat voor reden dan ook iets verandert in de authenticatie. Middels switch…case wordt gekeken welke actie uitgevoerd moet worden en wat voor impact dat op de state van de applicatie heeft. Binnen deze functie wordt gebruik gemaakt van een IIFE (Immediately Invoked Function Expression), een functie die gedeclareerd en direct uitgevoerd wordt, zodat we een return statement hebben op basis van de switch…case statement. Let ook op het consistent gebruik van async… await functies en het afhandelen van fouten met catch… throw.

type Action = 'login' | 'signup' | 'logout' | 'authChange';

const handleAuthentication = async (action: Action, email?: string, password?: string, currentUser?: any): Promise<boolean> => {
    try {

// start van de IIFE (Immediately Invoked Function Expression)

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
      })(); 

// Sluit de IIFE (Immediately Invoked Function Expression)

      const user = userCredential?.user || null;

// Hier worden twee functies achter elkaar uitgevoerd (loadUserProfile en loadState) die technisch best in één functie hadden kunnen staan. Echter, als we het principe van het scheiden van verantwoordelijkheden aanhouden is het beter twee functies te gebruiken, één voor het laden van de gebruikersgegevens, en één voor het laden van de state. Op deze manier blijft het overzichtelijker en zijn de beide functies onafhankelijk van elkaar te gebruiken, te ontwikkelen en te testen.

      if (user) {
        user.value = user;
        await loadUserProfile();
        await loadState();
      } else {
        resetState();
        state.stateLoaded = false;
      }
      return true;
    } catch (error) {
      console.error(`Authentication action "${action}" failed`, error);
      return false;
    }
  };

// onAuthStateChanged is de eventListener van Firebase die de veranderingen in de authorisatie detecteert en de zojuist besproken handler functie handleAuthentication activeert. Let wel, we gebruiken deze handler functie dus zowel na een user interactie als na een ‘spontaan’ opgetreden wijziging in de authenticatie.

onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      handleAuthentication('authChange', undefined, undefined, currentUser);
    } else {
      console.log('Geen ingelogde gebruiker.');
      // Andere logica wanneer er geen ingelogde gebruiker is
    }
  });

// Deze functie wordt steeds aangeroepen als er iets gebeurt op het vlak van authorisatie en gebruikersgegevens. 

  const loadUserProfile = async () => {
    if (!auth.currentUser) {
      console.error('No current user in Firebase Auth.');
      return;
    }

// Het gebruiken van de API van Firebase (doc en getDoc) om Firebase-documenten met gebruikersgegevens op te slaan, op te vragen en te muteren. Bekijk de pagina https://firebase.google.com/docs/firestore/query-data/get-data als u meer informatie zoekt over deze API.

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    } else {
      console.log('User document does not exist, creating a new one.');
      const defaultData = {
        displayName: auth.currentUser.displayName || '',
        birthdate: defaultBirthdate,
        avatarUrl: '',
      };
      await setDoc(userDocRef, defaultData);
      setUserProfile(defaultData);
    }

// Het gebruiken van de API van Firebase (onSnapshot) om naar realtime wijzigingen van documenten in de database te luisteren en de wijzigingen door te geven. Zie ook: https://firebase.google.com/docs/firestore/query-data/listen .
 
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
  };

// We stellen de userCredentials in op basis van de actuele gegeven uit de Firebase database óf gebruiken een standaard gebruikersnaam, datum en avatar.

  const setUserProfile = (data: any) => {
    userCredentials.displayName = data?.displayName || 'user';
    userCredentials.birthdate = data?.birthdate || defaultBirthdate;
    userCredentials.avatarUrl = data?.avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg';
  };

// De volgende functie komen ons als het goed is bekend voor, en stond in vergelijkbare vorm ook in ons vorige project. Deze hebben verder geen toelichting nodig.

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

// Dit is het mechanisme om deze functies beschikbaar te stellen als useGameStore in een Component geïnjecteerd wordt (volgens het Singleton principe).


  return {
    state,
    handleAuthentication,
    initializeCards,
    handleCardClick,
    resetState,
    addResult,
    saveState,
    loadState,
    fetchResults,
    user,
    userCredentials,
    loadUserProfile,
  };
});
