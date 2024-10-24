import { Card, CardSet, State } from '../models/models';
import { GameLogic } from '../utils/gameLogic';
import { injectable } from 'inversify';

@injectable()
export class CardService {
    private cards: Card[] = [];
    private state: State = {
        firstCard: { name: '', set: '' },
        secondCard: { name: '', set: '' },
        lockBoard: false,
        attempts: 0,
        gridSize: 0,
    };
    private cardSets: CardSet[] = [
        {set: "duck", card1: "", card2: ""},
        {set: "kitten", card1: "", card2: ""},
        {set: "piglet", card1: "", card2: ""},
        {set: "puppy", card1: "", card2: ""},
        {set: "calf", card1: "", card2: ""},
        {set: "veal", card1: "", card2: ""},
        {set: "lamb", card1: "", card2: ""},
        {set: "rooster", card1: "", card2: ""},
        {set: "horse", card1: "", card2: ""},
        {set: "mouse", card1: "", card2: ""},
        {set: "dog", card1: "", card2: ""},
        {set: "cat", card1: "", card2: ""},
        {set: "goose", card1: "", card2: ""},
        {set: "goat", card1: "", card2: ""},
        {set: "sheep", card1: "", card2: ""},
        {set: "pig", card1: "", card2: ""},
        {set: "cow", card1: "", card2: ""},
        {set: "chick", card1: "", card2: ""},
        {set: "hen", card1: "", card2: ""},
        {set: "donkey", card1: "", card2: ""},
        {set: "peacock", card1: "", card2: ""},
        {set: "pigeon", card1: "", card2: ""},
        {set: "fox", card1: "", card2: ""},
        {set: "hedgehog", card1: "", card2: ""},
    ];
    // Deze methode initialiseert de kaarten en stelt het spel in staat om te beginnen
    initializeCards(event: Event): Card[] {
        this.state.gridSize = parseInt((event.target as HTMLSelectElement).value);
        this.resetGameState(true);
        const totalCardSets = this.state.gridSize / 2;
        const selectedCardSets = GameLogic.shuffle([...this.cardSets]).slice(
            0,
            totalCardSets
        );
        this.cards = [];
        selectedCardSets.forEach((cardSet: CardSet) => {
            if (cardSet.card1 && cardSet.card2) {
                this.cards.push(this.createCard(cardSet.set, cardSet.card1));
                this.cards.push(this.createCard(cardSet.set, cardSet.card2));
            } else {
                this.cards.push(this.createCard(cardSet.set));
                this.cards.push(this.createCard(cardSet.set));
            }
        });
        return GameLogic.shuffle(this.cards);
    }
    // Deze methode handelt de klikactie op een kaart af en beheert de spelstatus
    handleCardClick(index: number, updateCallback: () => void) {
        const clickedCard = this.cards[index];
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
            if (this.cardsLeft(this.cards)) {
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
}