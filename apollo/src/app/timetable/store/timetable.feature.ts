import { createFeature } from "@ngrx/store";
import { timetableReducer } from "./timetable.reducer";

export const timetableFeature = createFeature({
   name: "timetable",
   reducer: timetableReducer
});
