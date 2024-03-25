import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { University } from "../../models";

export const universityActions = createActionGroup({
   source: 'University',
   events: {
      "Load universities": emptyProps(),
      "Save universities": props<{ universities: University[] }>(),
      "Save universities to store": props<{ universities: University[] }>()
   }
});
