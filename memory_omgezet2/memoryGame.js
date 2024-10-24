import { MemoryCard } from './memoryCard.js';

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
        this.cards = this.cardNames.concat(this.cardNames); // Verdubbel de kaarten
        this.cards = this.shuffle(this.cards);
        this.firstCard = null;
        this.secondCard = null;
        this.lockBoard = false;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        const board = document.createElement('div');
        board.classList.add('board');
        board.addEventListener('click', this.handleCardFlip.bind(this));
        this.cards.forEach(name => {
            const cardElement = document.createElement('memory-card');
            cardElement.setAttribute('name', name);
            cardElement.setAttribute('flipped', 'false');
            board.appendChild(cardElement);
        });
        this.shadowRoot.appendChild(board);

        const style = document.createElement('style');
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            .board {
                display: flex;
                flex-wrap: wrap;
                width: 900px;
                margin: auto;
            }
            memory-card {
                width: calc(20% - 20px);
                aspect-ratio: 1/1;
                margin: 10px;
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    handleCardFlip(event) {
        const card = event.target.closest('memory-card');
        if (!card || this.lockBoard || card === this.firstCard || card.getAttribute('flipped') === 'true') {
            return;
        }

        card.setAttribute('flipped', 'true');

        if (!this.firstCard) {
            this.firstCard = card;
            return;
        }

        this.secondCard = card;
        this.lockBoard = true;

        if (this.checkForMatch(this.firstCard.getAttribute('name'), this.secondCard.getAttribute('name'))) {
            this.disableCards();
        } else {
            this.unflipCards();
        }
    }

    checkForMatch(card1, card2) {
        return card1 === card2;
    }

    disableCards() {
        setTimeout(() => {
            this.resetBoard();
        }, 1000);
    }

    unflipCards() {
        setTimeout(() => {
            this.firstCard.setAttribute('flipped', 'false');
            this.secondCard.setAttribute('flipped', 'false');
            this.resetBoard();
        }, 1000);
    }

    resetBoard() {
        [this.firstCard, this.secondCard, this.lockBoard] = [null, null, false];
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

customElements.define('memory-game', MemoryGame);
