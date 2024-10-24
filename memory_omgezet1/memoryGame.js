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
        this.cards.forEach(name => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'hidden');
            cardElement.dataset.name = name;
            cardElement.addEventListener('click', this.flipCard.bind(this)); // Correct binding
            board.appendChild(cardElement);
        });
        this.shadowRoot.appendChild(board);

        const style = document.createElement('style');
        style.textContent = `
            *{
                box-sizing: border-box;
            }
            .board {
                display: flex;
                flex-wrap: wrap;
                width: 900px;
                margin: auto;
            }
            .card {
                width: calc(20% - 20px);
                aspect-ratio: 1/1;
                border: 1px solid #ccc;
                margin: 10px;
                cursor: pointer;
                background-color: #f0f0f0;
                position: relative;
            }
            img {
                width: 100%;
                height: 100%;
                position: absolute;
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    flipCard(event) {
        const card = event.currentTarget; // Get the clicked card
        if (this.lockBoard) return;
        if (card === this.firstCard) return;
        card.classList.remove('hidden');
        card.classList.add('flipped');
        card.innerHTML = `<img src="img/${card.dataset.name}.webp" alt="${card.dataset.name}">`;

        if (!this.firstCard) {
            this.firstCard = card;
        } else {
            this.secondCard = card;
            this.lockBoard = true;

            if (this.checkForMatch(this.firstCard.dataset.name, this.secondCard.dataset.name)) {
                this.resetBoard(true);
            } else {
                setTimeout(() => {
                    this.firstCard.classList.remove('flipped');
                    this.firstCard.classList.add('hidden');
                    this.firstCard.innerHTML = '';

                    this.secondCard.classList.remove('flipped');
                    this.secondCard.classList.add('hidden');
                    this.secondCard.innerHTML = '';

                    this.resetBoard(false);
                }, 1000);
            }
        }
    }

    checkForMatch(card1, card2) {
        return card1 === card2;
    }

    resetBoard(isMatch) {
        if (isMatch) {
            this.firstCard.removeEventListener('click', this.flipCard.bind(this));
            this.secondCard.removeEventListener('click', this.flipCard.bind(this));
        }

        [this.firstCard, this.secondCard] = [null, null];
        this.lockBoard = false;
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
