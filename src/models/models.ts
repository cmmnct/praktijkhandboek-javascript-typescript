export interface Card {
    name: string;
    set: string;
    exposed?: boolean;
  }
  
  export interface Result {
    date: string;
    attempts: number;
    gridSize: number;
    score: number;
  }
  
  export interface State {
    firstCard: Card | null;
    secondCard: Card | null;
    lockBoard: boolean;
    attempts: number;
    gridSize: number;
    cards: Card[];
    results: Result[];
    stateLoaded:boolean,
  }

  
  
  export interface CardSet {
    set: string;
    card1?: string;
    card2?: string;
  }
  export interface UserCredentials {
    displayName: string;
    oldPassword:string,
    newPassword: string;
    birthdate: string;
    avatarUrl: string;
  }
  
  export interface User {
    uid: string; // Unieke identificatie voor elke gebruiker
    displayName: string | null; // Naam van de gebruiker
    email: string | null; // Email adres van de gebruiker
    avatarUrl?: string; // Optioneel veld voor de avatar van de gebruiker
  }
  
  interface Player {
    uid: string;
    displayName: string;
  }
  
  export interface MultiPlayerState {
    firstCard: Card | null;
    secondCard: Card | null;
    lockBoard: boolean;
    cards: Card[];
    stateLoaded:boolean;
    currentPlayer: number;
    cardsPlayer1: Card[];
    cardsPlayer2: Card[]
  }
  
  export class MultiplayerInvitation {
    id: string;
    inviter: Player;
    invitee: Player;
    gameState: MultiPlayerState | null;
    gameId: string;
    status: 'pending' | 'accepted' | 'declined' | 'active' | 'waiting';
    timestamp: string;
    direction: 'incoming' | 'outgoing';
  
    constructor(data: Partial<MultiplayerInvitation>) {
      this.id = data.id || '';
      this.inviter = data.inviter || { uid: '', displayName: 'Unknown' };
      this.invitee = data.invitee || { uid: '', displayName: 'Unknown' };
      this.gameState = data.gameState || {
        firstCard: null,
        secondCard: null,
        lockBoard: false,
        cards: [],
        stateLoaded: false,
        currentPlayer: 0,  // Zet op de inviter als startende speler
        cardsPlayer1: [],
        cardsPlayer2: []
      };
      this.gameId = data.gameId || '';
      this.status = data.status || 'pending';
      this.timestamp = data.timestamp || new Date().toISOString();
      this.direction = data.direction || 'incoming';
    }
  
    // Method om de status bij te werken
    updateStatus(newStatus: 'pending' | 'accepted' | 'declined' | 'active' | 'waiting') {
      this.status = newStatus;
    }
  
    // Method om een mooiere timestamp weer te geven
    formattedTimestamp() {
      return new Date(this.timestamp).toLocaleString();
    }
  
    // Methode om te valideren of de uitnodiging geldig is
    isValid() {
      return this.inviter.uid !== '' && this.invitee.uid !== '';
    }
  }
  

  
  