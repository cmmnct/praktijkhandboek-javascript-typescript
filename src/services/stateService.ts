import { State } from '../models/models';
import { User } from 'firebase/auth';
import { injectable } from 'inversify';
import {
    saveToLocalStorage,
    loadFromLocalStorage,
} from '../utils/localStorageHelper';
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
    private initAuthListener() { }
    async saveState() {
        await saveToLocalStorage('memoryGameState', this.state);
    }
    async loadState() {
        const savedState = await loadFromLocalStorage('memoryGameState');
        if (savedState) {
            return savedState;
        }
    }
    getState(): State { return this.state }
    updateState(updatedState: Partial<State>) { console.log('State updated') }
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
        if (email === 'John Doe' && password === 'player')
            return 'succesvol ingelogd!'
        else return 'onbekende gebruiker of verkeerd wachtwoord'
    }
    async register(email: string, password: string) {
        if (email === 'John Doe' && password === 'player')
            return 'succesvol aangemeld!';
        else return 'gebruiker bestaat al';
    }
    logout() { console.log('logged out') }
}