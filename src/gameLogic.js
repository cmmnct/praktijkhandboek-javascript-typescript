export class GameLogic {
    static shuffle(array) {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    static checkForMatch(card1, card2) {
        return card1 === card2;
    }

    static areCardsLeft(cards) {
        return cards.some(card => !card.flipped);
    }
}
