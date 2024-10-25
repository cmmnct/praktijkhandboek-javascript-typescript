import { auth, firestore } from "../../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { State } from "../models/models";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {
    loadFromLocalStorage,
    saveToLocalStorage,
} from "../utils/localStorageHelper";
import { injectable } from "inversify";
@injectable()
export class StateService {
    private user: User | null = null;
    private state: State = {
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        attempts: 0,
        gridSize: 0,
        cards: [],
        results: [],
    };
    constructor() {
        this.initAuthListener();
    }
    private initAuthListener() {
        onAuthStateChanged(auth, (user) => {
            this.user = user;
        });
    }
    async saveState() {
        const userId = this.user?.uid;
        if (userId) {
            const stateRef = doc(firestore, `users/${userId}/gameState/state`);
            await setDoc(stateRef, this.state);
        } else {
            saveToLocalStorage("memoryGameState", this.state);
        }
    }
    async loadState() {
        const userId = this.user?.uid;
        if (userId) {
            const stateRef = doc(firestore, `users/${userId}/gameState/state`);
            const stateDoc = await getDoc(stateRef);
            if (stateDoc.exists()) {
                this.state = stateDoc.data() as State;
            }
        } else {
            const savedState = loadFromLocalStorage("memoryGameState");
            if (savedState) {
                this.state = savedState;
            }
        }
    }
    getState(): State {
        return this.state;
    }
    updateState(updatedState: Partial<State>) {
        this.state = { ...this.state, ...updatedState };
        this.saveState();
    }
    resetState(init: boolean = false) {
        this.state.firstCard = null;
        this.state.secondCard = null;
        this.state.lockBoard = false;
        this.saveState();
        if (init) {
            this.state.attempts = 0;
            this.state.cards = [];
        }
    }
    async login(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            return `Logged in as ${userCredential.user.email}`;
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }
    async register(email: string, password: string) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            return `Registered as ${userCredential.user.email}`;
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }
    async logout(updateCallback: () => void) {
        auth.signOut().then(() => {
            this.resetState(true);
            updateCallback();
        });
    }
}