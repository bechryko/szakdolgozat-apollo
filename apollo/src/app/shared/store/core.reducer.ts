import { createReducer, on } from "@ngrx/store";
import { completionsActions, universityActions } from "./actions";
import { CoreState } from "./core.state";

const initialState: CoreState = {
   completions: null,
   universities: null
};

export const coreReducer = createReducer(
   initialState,
   on(completionsActions.saveCompletionsToStore, (state, { completions }) => ({ ...state, completions: completions })),
   on(completionsActions.deleteData, state => ({ ...state, completions: null })),
   on(universityActions.saveUniversitiesToStore, (state, { universities }) => ({ ...state, universities }))
);
