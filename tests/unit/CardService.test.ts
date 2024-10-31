import { describe, it, expect, vi } from 'vitest';
import { cardService } from '@/services/cardService';
import { fetchCards } from '@/services/apiService';
import { Card, CardSet } from '@/models/models';

// Mock de fetchCards functie om geen echte API-aanroepen te doen
vi.mock('@/services/apiService', () => ({
  fetchCards: vi.fn(() => Promise.resolve([
    {
      "set": "duck",
      "card1": "",
      "card2": ""
    },
    {
      "set": "kitten",
      "card1": "",
      "card2": ""
    },
    // voeg alle overige sets toe
  ])),
}));

describe('CardService', () => {
  it('moet kaarten correct initialiseren en shuffelen', async () => {
    const gridSize = 4;
    const cards = await cardService.initializeCards(gridSize);

    expect(cards.length).toBe(gridSize); // Controleer of het aantal kaarten klopt
    expect(cards.every(card => card.set)).toBe(true); // Elke kaart moet een set hebben
  });

  it('moet kaarten in willekeurige volgorde teruggeven', async () => {
    const gridSize = 4;
    const cards1 = await cardService.initializeCards(gridSize);
    const cards2 = await cardService.initializeCards(gridSize);

    expect(cards1).not.toEqual(cards2); // Controleer of de volgorde verschilt
  });
});
