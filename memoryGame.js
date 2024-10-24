import { MemoryCard } from './memoryCard.js';
import { GameLogic } from './gameLogic.js';

export class MemoryGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cardNames = [
            "duck", "kitten", "piglet", "puppy", "calf", "veal",
            "lamb", "rooster", "horse", "mouse", "dog", "cat",
            "goose", "goat", "sheep", "pig", "cow", "chick",
            "hen", "donkey", "peacock", "pigeon", "fox", "hedgehog"
        ];
        this.cards = this.cardNames.concat(this.cardNames).map(name => ({ name, flipped: false }));
        this.cards = GameLogic.shuffle(this.cards);
        this.state = {
            firstCard: null,
            secondCard: null,
            lockBoard: false
        };
        this.render();
    }

    connectedCallback() {
        this.setupBoard();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                }
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
            </style>
            <div class="board">
                ${this.cards.map(card => `
                    <memory-card name="${card.name}" flipped="${card.flipped}"></memory-card>
                `).join('')}
            </div>
        `;
        this.board = this.shadowRoot.querySelector('.board');
    }

    setupBoard() {
        this.board.addEventListener('click', async (event) => {
            const cardElement = event.target.closest('memory-card');
            if (!cardElement || this.state.lockBoard || cardElement === this.state.firstCard || cardElement.getAttribute('flipped') === 'true') {
                return;
            }

            cardElement.setAttribute('flipped', 'true');

            if (!this.state.firstCard) {
                this.state.firstCard = cardElement;
                return;
            }

            this.state.secondCard = cardElement;
            this.state.lockBoard = true;

            const firstCardName = this.state.firstCard.getAttribute('name');
            const secondCardName = this.state.secondCard.getAttribute('name');

            if (GameLogic.checkForMatch(firstCardName, secondCardName)) {
                await this.updateCardsState(firstCardName, secondCardName, true);
            } else {
                await this.updateCardsState(firstCardName, secondCardName, false);
            }

            this.state = {
                firstCard: null,
                secondCard: null,
                lockBoard: false
            };

            if (!GameLogic.areCardsLeft(this.cards)) {
                alert('Game Over!');
            }
        });
    }


    async updateCardsState(firstCardName, secondCardName, isMatch) {
        if (isMatch) {
            this.cards.forEach(card => {
                if (card.name === firstCardName || card.name === secondCardName) {
                    card.flipped = true;
                }
            });
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.state.firstCard.setAttribute('flipped', 'false');
            this.state.secondCard.setAttribute('flipped', 'false');
        }

        this.updateBoard();
    }

    updateBoard() {
        this.cards.forEach((card, index) => {
            const cardElement = this.board.children[index];
            if (cardElement.getAttribute('flipped') !== String(card.flipped)) {
                cardElement.setAttribute('flipped', card.flipped);
            }
        });
    }
}

customElements.define('memory-game', MemoryGame);
