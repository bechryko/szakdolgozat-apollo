import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { UniversityCompletionYear } from "../models";

export const coreActions = createActionGroup({
   source: "Core",
   events: {
      "Load completions": emptyProps(),
      "Save completions to store": props<{ completions: UniversityCompletionYear[] }>(),
      "Save completions": props<{ completions: UniversityCompletionYear[] }>()
   }
});
