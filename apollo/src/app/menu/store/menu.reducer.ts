import { createReducer, on } from "@ngrx/store";
import { menuActions } from "./menu.actions";
import { MenuState } from "./menu.state";

const initialState: MenuState = {
   cards: []
};

export const menuReducer = createReducer(
   initialState,
   on(menuActions.loadCardsSuccess, (_, { cards }) => ({ cards }))
);
