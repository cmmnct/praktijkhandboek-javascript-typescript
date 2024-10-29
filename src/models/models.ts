export type Card = {
    name: string;
    set: string;
    exposed?: boolean;
  };
  
  export type CardSet = {
    set: string;
    card1?: string;
    card2?: string;
  };
  
  export type Result = {
    date: string;
    attempts: number;
    gridSize: number;
    score: number;
  };
  
  export type State = {
    firstCard: Card | null;
    secondCard: Card | null;
    lockBoard: boolean;
    attempts: number;
    gridSize: number;
    cards: Card[]; // voeg deze regel toe
    results:Result[];
    stateLoaded:Boolean
  };

  export interface UserCredentials {
    displayName: string;
    oldPassword: string;
    newPassword: string;
    birthdate: string;
    avatarUrl: string;
  }
  