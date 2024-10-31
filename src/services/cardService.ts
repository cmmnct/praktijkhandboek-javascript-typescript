import { fetchCards } from './apiService';
import { Card, CardSet } from '@/models/models';

class CardService {
  async initializeCards(gridSize: number): Promise<Card[]> {
    try {
      const cardData: CardSet[] = await fetchCards();
      const cards = this.createCardsFromSets(cardData, gridSize);
      return this.shuffle(cards);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }

  private createCardsFromSets(cardSets: CardSet[], gridSize: number): Card[] {
    const totalCardSets = gridSize / 2;
    const selectedCardSets = this.shuffle([...cardSets]).slice(0, totalCardSets);

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

  private createCard(set: string, name?: string, exposed: boolean = false): Card {
    return {
      name: name || set,
      set,
      exposed,
    };
  }

  private shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}

export const cardService = new CardService();
