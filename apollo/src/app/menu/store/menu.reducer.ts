import { createReducer, on } from "@ngrx/store";
import { MenuState } from "./menu-state";
import { menuActions } from "./menu.actions";

const initialState: MenuState = {
   cards: []
};

export const menuReducer = createReducer(
   initialState,
   on(menuActions.loadCardsSuccess, (_, { cards }) => ({ cards }))
);
