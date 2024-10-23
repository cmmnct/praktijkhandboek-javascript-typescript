import { LitElement, html, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import "./memoryCard.js";
import { GameLogic } from "../utils/gameLogic.js";
import { Card, CardSet, State } from "../models/models.js";

const createCard = (
  set: string,
  name?: string,
  exposed: boolean = false
): Card => ({
  name: name || set,
  set,
  exposed,
});


@customElement("memory-game")
export class MemoryGame extends LitElement {
  @property({ type: Array }) cards: Card[] = [];
  @property({ type: Object }) state: State = {
    firstCard: null,
    secondCard: null,
    lockBoard: false,
  };
  @property({ type: Number }) attempts: number = 0;
  @property({ type: Number }) gridSize: number = 0;

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

  constructor() {
    super();
    this.cards = [];
  }

// styles ----------------------------------------------------------------------
static styles = css`
.board {
  display: flex;
  flex-wrap: wrap;
  max-width: 900px;
  margin: auto;
}
.board16 memory-card {
  width: calc(25% - 20px);
  aspect-ratio: 1/1;
  margin: 10px;
}
.board24 memory-card {
  width: calc(20% - 20px);
  aspect-ratio: 1/1;
  margin: 10px;
}
.board36 memory-card {
  width: calc(16.66% - 20px);
  aspect-ratio: 1/1;
  margin: 10px;
}
.scoreboard {
  text-align: center;
  margin-bottom: 20px;
}
.select-grid {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
select {
  padding: 10px;
  font-size: 16px;
}
`;

// template ----------------------------------------------------------------------
render() {
return html`
  <div class="select-grid">
    <select @change="${this.handleGridSizeChange}">
      <option selected disabled>Kies je speelveld</option>
      <option value="16">4 x 4</option>
      <option value="24">5 x 5</option>
      <option value="36">6 x 6</option>
    </select>
  </div>
  <div class="scoreboard">
    <p>Aantal pogingen: ${this.attempts}</p>
  </div>
  <div class="board board${this.gridSize}">
    ${this.cards.map((card, index) => html`
      <memory-card
        .name="${card.name}"
        .exposed="${card.exposed}"
        @click="${() => this.handleCardClick(index, card)}">
      </memory-card>
    `)}
  </div>
`;
}

  handleGridSizeChange(event: Event) {

    this.gridSize = parseInt((event.target as HTMLSelectElement).value);
    const totalCardSets = this.gridSize / 2;
    const selectedCardSets = GameLogic.shuffle([...this.cardSets]).slice(
      0,
      totalCardSets
    );
    this.cards = [];

    selectedCardSets.forEach((cardSet: CardSet) => {
      if (cardSet.card1 && cardSet.card2) {
        this.cards.push(createCard(cardSet.set, cardSet.card1));
        this.cards.push(createCard(cardSet.set, cardSet.card2));
      } else {
        this.cards.push(createCard(cardSet.set));
        this.cards.push(createCard(cardSet.set));
      }
    });

    this.cards = GameLogic.shuffle(this.cards);
    this.resetGameState(true);
  }

  handleCardClick(index: number, card: Card) {
    if (this.state.lockBoard || card === this.state.firstCard || card.exposed) 
        {return;}
    card.exposed = true;

    if (!this.state.firstCard) {
      this.state = { ...this.state, firstCard: card };
      return;
    }

    this.state = { ...this.state, secondCard: card, lockBoard: true };
    this.attempts += 1;

    // Null check before calling checkForMatch
    if (this.state.firstCard && this.state.secondCard) {
      if (
        GameLogic.checkForMatch(
          this.state.firstCard.set,
          this.state.secondCard.set
        )
      ) {
        this.updateCardsState(true);
      } else {
        setTimeout(() => this.updateCardsState(false), 1000);
      }
    }

    if (!GameLogic.areCardsLeft(this.cards)) {
      alert("Gefeliciteerd! Je hebt alle kaarten gevonden.");
    }
  }

  updateCardsState(isMatch: boolean) {
    if (!isMatch) {
      if (this.state.firstCard) this.state.firstCard.exposed = false;
      if (this.state.secondCard) this.state.secondCard.exposed = false;
    }
    this.resetGameState()
    this.requestUpdate();
  }

// De functie resetGameState is toegevoegd om de herhalende code te beperken en 
// wordt nu gebruikt om zowel de state tussen elke stap te resetten en de reset
// van het hele spel
  resetGameState(init=false) {
    if (init) this.attempts = 0;
    this.state = {
      firstCard: null,
      secondCard: null,
      lockBoard: false,
    };
  }
}
