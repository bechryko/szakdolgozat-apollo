import { UniversityMajor } from "@apollo/shared/models";
import { createActionGroup, props } from "@ngrx/store";

export const universityMajorActions = createActionGroup({
   source: 'University Major',
   events: {
      "Load university majors": props<{ universityId: string }>(),
      "Save university majors to store": props<{ universityMajors: UniversityMajor[] }>(),
      "Save university majors": props<{ universityMajors: UniversityMajor[], universityId: string }>(),
      "Save single university major": props<{ universityMajor: UniversityMajor }>(),
      "Load single university major": props<{ majorId: string }>()
   }
});
