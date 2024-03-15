import { createActionGroup, props } from "@ngrx/store";
import { AlternativeSemester } from "../models";

export const averagesActions = createActionGroup({
   source: "Averages",
   events: {
      "Save alternative semester": props<{ alternativeSemester: AlternativeSemester }>(),
      "Remove alternative semester": props<{ id: string, semesterType: 'firstSemesterGrades' | 'secondSemesterGrades' }>()
   }
});
