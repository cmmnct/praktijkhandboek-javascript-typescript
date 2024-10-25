import { Card, CardSet, Result, State } from "../models/models";
import { GameLogic } from "../utils/gameLogic";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { StateService } from "./stateService";

@injectable()
export class CardService {
  constructor(@inject(TYPES.StateService) private stateService: StateService) {
    this.stateService.loadState(); // Laad de state bij het initialiseren van de service
  }

  async initializeCards(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const gridSize = parseInt(target.value);
    this.stateService.updateState({ gridSize });
    this.stateService.resetState(true);

    try {
      const response = await fetch(
        "https://my-json-server.typicode.com/cmmnct/cards/cards"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const cardData = await response.json();
      const cards = this.createCardsFromSets(cardData, gridSize);
      const shuffledCards = GameLogic.shuffle(cards);
      this.stateService.updateState({ cards: shuffledCards });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  private createCardsFromSets(cardSets: CardSet[], gridSize: number): Card[] {
    const totalCardSets = gridSize / 2;
    const selectedCardSets = GameLogic.shuffle([...cardSets]).slice(
      0,
      totalCardSets
    );

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

  handleCardClick(index: number, updateCallback: () => void) {
    let state = this.stateService.getState();
    const clickedCard = state.cards[index];
    if (this.isInvalidClick(clickedCard)) return;

    clickedCard.exposed = true;
    updateCallback();

    if (!state.firstCard) {
      this.stateService.updateState({ firstCard: clickedCard });
      return;
    }

    this.stateService.updateState({
      secondCard: clickedCard,
      attempts: state.attempts + 1,
      lockBoard: true,
    });
    state = this.stateService.getState(); // Update state after changes
    updateCallback();

    if (state.firstCard!.set === state.secondCard!.set) {
      if (this.cardsLeft(state.cards)) {
        this.stateService.resetState();
        updateCallback();
      } else {
        alert("Gefeliciteerd! Je hebt alle kaarten gevonden.");
        this.addResult();
      }
    } else {
      setTimeout(() => {
        state.firstCard!.exposed = false;
        state.secondCard!.exposed = false;
        this.stateService.resetState();
        updateCallback();
      }, 1000);
    }
  }

  private addResult() {
    const state = this.stateService.getState();
    const result: Result = {
      date: new Date().toISOString(),
      attempts: state.attempts,
      gridSize: state.gridSize!,
      score: Math.max(0, state.gridSize! * 2 - state.attempts),
    };
    this.stateService.updateState({ results: [...state.results, result] });
  }

  private cardsLeft(cards: Card[]): boolean {
    return cards.some((card) => !card.exposed);
  }

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

  private isInvalidClick(clickedCard: Card): boolean {
    const state = this.stateService.getState();
    return !!(
      state.lockBoard ||
      clickedCard === state.firstCard ||
      clickedCard.exposed
    );
  }
}
