import { createReducer, on } from "@ngrx/store";
import { userActions } from "./actions";
import { completionsActions } from "./actions/completions.actions";
import { CoreState } from "./core.state";

const initialState: CoreState = {
   completionYears: null
};

export const coreReducer = createReducer(
   initialState,
   on(completionsActions.saveCompletionsToStore, (state, { completions }) => ({ ...state, completionYears: completions })),
   on(userActions.clearUserData, () => initialState)
);
