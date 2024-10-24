import { Container } from 'inversify';
import 'reflect-metadata';
import { CardService } from './src/services/cardService';
const TYPES = {
CardService: Symbol.for('CardService'),
StateService: Symbol.for('StateService'),
};
export { TYPES };
const container = new Container();
container.bind<CardService>(TYPES.CardService).to(CardService);
export { container };