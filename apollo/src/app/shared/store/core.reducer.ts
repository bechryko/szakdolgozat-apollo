import { createReducer, on } from "@ngrx/store";
import { completionsActions, universityActions, universityMajorActions, universitySubjectActions } from "./actions";
import { CoreState } from "./core.state";

const initialState: CoreState = {
   completions: null,
   universities: null,
   universitySubjects: null,
   universityMajors: null
};

export const coreReducer = createReducer(
   initialState,
   on(completionsActions.saveCompletionsToStore, (state, { completions }) => ({ ...state, completions: completions })),
   on(completionsActions.deleteData, state => ({ ...state, completions: null })),
   on(universityActions.saveUniversitiesToStore, (state, { universities }) => ({ ...state, universities })),
   on(universitySubjectActions.saveUniversitySubjectsToStore, (state, { universitySubjects }) => {
      const subjects = [...state.universitySubjects ?? []];

      universitySubjects.forEach(subject => {
         const idx = subjects.findIndex(s => s.id === subject.id);
         if(idx !== -1) {
            subjects[idx] = subject;
         } else {
            subjects.push(subject);
         }
      });
      
      return { ...state, universitySubjects: subjects };
   }),
   on(universityMajorActions.saveUniversityMajorsToStore, (state, { universityMajors }) => {
      const majors = [...state.universityMajors ?? []];

      universityMajors.forEach(major => {
         const idx = majors.findIndex(m => m.id === major.id);
         if(idx !== -1) {
            majors[idx] = major;
         } else {
            majors.push(major);
         }
      });
      
      return { ...state, universityMajors: majors };
   })
);
