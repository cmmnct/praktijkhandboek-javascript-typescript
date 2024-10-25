import { Container } from "inversify";
import "reflect-metadata";
import { CardService } from "./src/services/cardService";
import { StateService } from "./src/services/stateService";
import { TYPES } from "./src/types";

const container = new Container();
container
    .bind<CardService>(TYPES.CardService)
    .to(CardService)
    .inSingletonScope();
container
    .bind<StateService>(TYPES.StateService)
    .to(StateService)
    .inSingletonScope();
export { container };
