import { createReducer, on } from "@ngrx/store";
import { timetableActions } from "./timetable.actions";
import { TimetableState } from "./timetable.state";

const initialState: TimetableState = {
   semesters: [],
   selectedSemesterId: undefined
};

export const timetableReducer = createReducer(
   initialState,
   on(timetableActions.saveTimetableToStore, (_, { newState }) => newState)
);
