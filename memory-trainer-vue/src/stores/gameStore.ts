import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { cardService } from '@/services/cardService';
import { db, auth } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth';
import { State, Result, UserCredentials } from '@/models/models';

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

    const user = ref(auth.currentUser);
    const userCredentials = reactive<UserCredentials>({
        displayName: '',
        password: '',
        birthdate: '',
        avatarUrl: '',
    });
    const defaultBirthdate = new Date().toISOString().substring(0, 10);

    type Action = 'login' | 'signup' | 'logout' | 'authChange';

    const handleAuthentication = async (action: Action, email?: string,
        password?: string, currentUser?: any): Promise<boolean> => {
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
                        return currentUser ? { user: currentUser } : null; // Simuleer een
                    default:
                        throw new Error('Invalid auth action');
                }
            })();
            // Sluit de IIFE (Immediately Invoked Function Expression)

            const user = userCredential?.user || null;

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
            console.error(`Authentication action “${action}” failed`, error);
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
            console.error('No current user in Firebase Auth.');
            return;

        }

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

        onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
        });
    };

    const setUserProfile = (data: any) => {
        userCredentials.displayName = data?.displayName || 'user';
        userCredentials.birthdate = data?.birthdate || defaultBirthdate;
        userCredentials.avatarUrl = data?.avatarUrl ||
            'https://ionicframework.com/docs/img/demos/avatar.svg';
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
            gridSize: state.gridSize || 16,
            score: Math.max(0, state.gridSize || 16 * 2 - state.attempts),
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
                await initializeCards(state.gridSize || 16);
                await saveState();
            }
        } else {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {

                Object.assign(state, JSON.parse(savedState));
            } else {
                await initializeCards(state.gridSize || 16);
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
        user,
        userCredentials,
        loadUserProfile,
        handleAuthentication
    };
});