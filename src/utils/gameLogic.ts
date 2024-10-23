import { Card } from "../models/models";

export class GameLogic {
    static shuffle(array:any[]) {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    static areCardsLeft(cards:Card[]) {
        return cards.some(card => !card.exposed);
    }

    static checkForMatch(set1:String, set2:string){
       return set1 === set2 ? true : false

    }

}