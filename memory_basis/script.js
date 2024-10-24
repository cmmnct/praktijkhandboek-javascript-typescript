const cardNames = [ 
    "duck", "kitten", "piglet", "puppy", "calf", "veal",
    "lamb", "rooster", "horse", "mouse", "dog", "cat",
    "goose", "goat", "sheep", "pig", "cow", "chick",
    "hen", "donkey", "peacock", "pigeon", "fox", "hedgehog"
];
let cards = cardNames.concat(cardNames); // Verdubbel de kaarten
cards = shuffle(cards);

const gameBoard = document.getElementById('game-board');
let firstCard = null;
let secondCard = null;
let lockBoard = false;

// Maak kaart elementen en voeg ze toe aan het bord
cards.forEach(name => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.name = name;
    cardElement.addEventListener('click', flipCard);
    gameBoard.appendChild(cardElement);
});

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    this.innerHTML = `<img src="img/${this.dataset.name}.webp" alt="${this.dataset.name}">`;

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        lockBoard = true;

        if (checkForMatch(firstCard.dataset.name, secondCard.dataset.name)) {
            resetBoard(true);
        } else {
            setTimeout(() => {
                firstCard.innerHTML = '';
                secondCard.innerHTML = '';

                resetBoard(false);
            }, 1000);
        }
    }
}

function checkForMatch(card1, card2) {
    return card1 === card2;
}

function resetBoard(isMatch) {
    if (isMatch) {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
    }

    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



