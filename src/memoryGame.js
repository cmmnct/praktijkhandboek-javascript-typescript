import { LitElement, html, css } from 'lit';
import './memoryCard.js';
import { GameLogic } from './gameLogic.js';

export class MemoryGame extends LitElement {
  static properties = {
    cards: { type: Array },
    state: { type: Object },
    attempts: { type: Number }
  };

  static styles = css`
    .board {
      display: flex;
      flex-wrap: wrap;
      max-width: 900px;
      margin: auto;
    }
    memory-card {
      width: calc(20% - 20px);
      aspect-ratio: 1/1;
      margin: 10px;
    }
    .scoreboard {
      text-align: center;
      margin-bottom: 20px;
    }
  `;

  constructor() {
    super();
    this.cardNames = [
      "duck", "kitten", "piglet", "puppy", "calf", "veal",
      "lamb", "rooster", "horse", "mouse", "dog", "cat",
      "goose", "goat", "sheep", "pig", "cow", "chick",
      "hen", "donkey", "peacock", "pigeon", "fox", "hedgehog"
    ];
    this.cards = GameLogic.shuffle(this.cardNames.concat(this.cardNames).map(name => ({ name, flipped: false })));
    this.state = {
      firstCard: null,
      secondCard: null,
      lockBoard: false
    };
    this.attempts = 0;
  }

  render() {
    return html`
      <div class="scoreboard">
        <p>Aantal pogingen: ${this.attempts}</p>
      </div>
      <div class="board">
        ${this.cards.map((card, index) => html`
          <memory-card
            .name="${card.name}"
            .flipped="${card.flipped}"
            @click="${() => this.handleCardFlip(index)}">
          </memory-card>
        `)}
      </div>
    `;
  }

  handleCardFlip(index) {
    const card = this.cards[index];
    if (this.state.lockBoard || card === this.state.firstCard || card.flipped) {
      return;
    }

    this.cards[index].flipped = true;

    if (!this.state.firstCard) {
      this.state = { ...this.state, firstCard: card };
      return;
    }

    this.state = { ...this.state, secondCard: card, lockBoard: true };
    this.attempts += 1;

    if (GameLogic.checkForMatch(this.state.firstCard.name, this.state.secondCard.name)) {
      this.updateCardsState(true);
    } else {
      setTimeout(() => this.updateCardsState(false), 1000);
    }

    if (!GameLogic.areCardsLeft(this.cards)) {
      alert('Gefeliciteerd! Je hebt alle kaarten gevonden.');
    }
  }

  updateCardsState(isMatch) {
    if (!isMatch) {
      this.state.firstCard.flipped = false;
      this.state.secondCard.flipped = false;
    }

    this.state = {
      firstCard: null,
      secondCard: null,
      lockBoard: false
    };
  }
}

customElements.define('memory-game', MemoryGame);
