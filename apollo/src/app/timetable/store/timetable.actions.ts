import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { TimetableState } from "./timetable.state";

export const timetableActions = createActionGroup({
   source: "Timetable",
   events: {
      "Load timetable": emptyProps(),
      "Save timetable to store": props<{ newState: TimetableState }>(),
      "Update timetable": props<{ newState: TimetableState }>(),
      "Delete data": emptyProps(),
      "Delete guest data": emptyProps()
   }
});
