import { Card, CardSet, State } from '../models/models';
import { GameLogic } from '../utils/gameLogic';
import { injectable } from 'inversify';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorageHelper';

@injectable()
export class CardService {
    private state: State;

   
    constructor() {
        this.state = this.loadGameState() || {
            firstCard: null,
            secondCard: null,
            lockBoard: false,
            attempts: 0,
            gridSize: 0,
            cards: [],
        };
    }

    // Deze methode initialiseert de kaarten en stelt het spel in staat om te beginnen
    async initializeCards(event: Event): Promise<State> {
        const target = event.target as HTMLSelectElement;
        this.state.gridSize = parseInt(target.value);
        this.resetGameState(true);
        try {
            const response = await fetch(
                'https://my-json-server.typicode.com/cmmnct/cards/cards'
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const cardData = await response.json();
            const cards = this.createCardsFromSets(cardData, this.state.gridSize);
            this.state.cards = GameLogic.shuffle(cards);
            this.saveGameState();
            return this.state;
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return this.state;
        }
    }


    private createCardsFromSets(cardSets: CardSet[], gridSize: number): Card[] {
        const totalCardSets = gridSize / 2;
        const selectedCardSets = GameLogic.shuffle([...cardSets]).slice(0,totalCardSets);
        const cards: Card[] = [];
        selectedCardSets.forEach((cardSet: CardSet) => {
            if (cardSet.card1 && cardSet.card2) {
                cards.push(this.createCard(cardSet.set, cardSet.card1));
                cards.push(this.createCard(cardSet.set, cardSet.card2));
            } else {
                cards.push(this.createCard(cardSet.set));
                cards.push(this.createCard(cardSet.set));
            }
        });
        return cards;
    }

    // Deze methode handelt de klikactie op een kaart af en beheert de spelstatus
    handleCardClick(index: number, updateCallback: () => void) {
        const clickedCard = this.state.cards[index];
        if (this.isInvalidClick(clickedCard)) return;
        clickedCard.exposed = true;
        updateCallback();
        if (!this.state.firstCard) {
            this.state.firstCard = clickedCard;
            return;
        }
        this.state.secondCard = clickedCard;
        this.state.attempts++;
        this.state.lockBoard = true;
        updateCallback();
        if (this.state.firstCard.set === this.state.secondCard.set) {
            if (this.cardsLeft(this.state.cards)) {
                this.resetGameState();
                updateCallback();
            } else {
                alert('Gefeliciteerd! Je hebt alle kaarten gevonden.');
            }
        } else {
            setTimeout(() => {
                this.state.firstCard!.exposed = false;
                this.state.secondCard!.exposed = false;
                this.resetGameState();
                updateCallback();
            }, 1000);
        }
        this.saveGameState();
    }
    // Deze methode retourneert de huidige status van het spel
    getState() {
        return this.state;
    }
    // Deze methode retourneert de huidige gridgrootte
    getGridSize() {
        return this.state.gridSize;
    }
    // Interne methode om te controleren of er nog ongeëxposeerde kaarten zijn
    private cardsLeft(cards: Card[]): boolean {
        return cards.some((card) => !card.exposed);
    }
    // Interne methode om een kaartobject aan te maken
    private createCard(
        set: string,
        name?: string,
        exposed: boolean = false
    ): Card {
        return {
            name: name || set,
            set,
            exposed,
        };
    }
    // Interne methode om de spelstatus te resetten
    private resetGameState(init: boolean = false) {
        this.state.firstCard = null;
        this.state.secondCard = null;
        this.state.lockBoard = false;
        if (init) {
            this.state.attempts = 0;
        }
    }
    // Interne methode om te controleren of een klik ongeldig is
    private isInvalidClick(clickedCard: Card): boolean {
        return !!(
            this.state.lockBoard ||
            clickedCard === this.state.firstCard ||
            clickedCard.exposed
        );
    }
    private saveGameState() {
        saveToLocalStorage('memoryGameState', this.state);
    }
    private loadGameState() {
        const savedState = loadFromLocalStorage('memoryGameState');
        if (savedState) {
            return savedState;
        }
    }

}