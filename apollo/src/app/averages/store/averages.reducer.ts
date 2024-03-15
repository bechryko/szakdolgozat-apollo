import { createReducer, on } from "@ngrx/store";
import { averagesActions } from "./averages.actions";
import { AveragesState } from "./averages.state";

const initialState: AveragesState = {
   alternativeSemesters: []
};

export const averagesReducer = createReducer(
   initialState,
   on(averagesActions.saveAlternativeSemester, (state, { alternativeSemester }) => {
      const alternativeSemesters = [...state.alternativeSemesters];
      const index = alternativeSemesters.findIndex(alternative => alternative.id === alternativeSemester.id && alternative.type === alternativeSemester.type);
      if(index === -1) {
         alternativeSemesters.push(alternativeSemester);
      } else {
         alternativeSemesters[index] = alternativeSemester;
      }
      return {
         ...state,
         alternativeSemesters
      };
   }),
   on(averagesActions.removeAlternativeSemester, (state, { id, semesterType }) => ({
      ...state,
      alternativeSemesters: state.alternativeSemesters.filter(alternativeSemester => !(alternativeSemester.id === id && alternativeSemester.type === semesterType))
   }))
);
