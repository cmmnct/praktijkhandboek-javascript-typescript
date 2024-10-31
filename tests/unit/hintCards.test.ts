import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/gameStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Hint Feature in Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should return two unexposed hint cards if available', () => {
    const gameStore = useGameStore();
    gameStore.state.cards = [
      { name: 'A', set: 'set1', exposed: false },
      { name: 'B', set: 'set1', exposed: false },
      { name: 'C', set: 'set2', exposed: true },
    ];

 it('should return an empty array if less than two unexposed cards are available', () => {
        const gameStore = useGameStore();
        gameStore.state.cards = [{ name: 'A', set: 'set1', exposed: true }];
        expect(gameStore.getHintCards()).toEqual([]);
      });

    const hintCards = gameStore.getHintCards();

it('should only return unexposed cards', () => {
        const gameStore = useGameStore();
        gameStore.state.cards = [
          { name: 'A', set: 'set1', exposed: false },
          { name: 'B', set: 'set1', exposed: true },
          { name: 'C', set: 'set2', exposed: false },
        ];
        const hintCards = gameStore.getHintCards();
      
        expect(hintCards.every(card => !card.exposed)).toBe(true);
      });

    // Verwacht dat de test faalt omdat de functie nog niet geïmplementeerd is
    expect(hintCards.length).toBe(2);
  });
});
