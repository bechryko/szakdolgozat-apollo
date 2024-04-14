import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { UniversityCompletionYear, UniversitySubject } from "../../models";

export const completionsActions = createActionGroup({
   source: "Completions",
   events: {
      "Load completions": emptyProps(),
      "Save completions to store": props<{ completions: UniversityCompletionYear[] }>(),
      "Save completions": props<{ completions: UniversityCompletionYear[] }>(),
      "Complete subject": props<{ subject: UniversitySubject }>(),
      "Delete data": emptyProps(),
      "Delete guest data": emptyProps()
   }
});
