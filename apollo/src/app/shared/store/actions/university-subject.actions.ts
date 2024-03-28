import { UniversitySubject } from "@apollo/shared/models";
import { createActionGroup, props } from "@ngrx/store";

export const universitySubjectActions = createActionGroup({
   source: "University Subject",
   events: {
      "Load university subjects": props<{ universityId: string }>(),
      "Save university subjects to store": props<{ universitySubjects: UniversitySubject[] }>(),
      "Save university subjects": props<{ universitySubjects: UniversitySubject[], universityId: string }>(),
      "Save single university subject": props<{ universitySubject: UniversitySubject }>()
   }
});
