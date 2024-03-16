import { createReducer, on } from "@ngrx/store";
import { coreActions } from "./core.actions";
import { CoreState } from "./core.state";

const initialState: CoreState = {
   completionYears: null
};

export const coreReducer = createReducer(
   initialState,
   on(coreActions.saveCompletionsToStore, (state, { completions }) => ({ ...state, completionYears: completions }))
);
