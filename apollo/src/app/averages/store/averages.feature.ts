import { createFeature } from "@ngrx/store";
import { averagesReducer } from "./averages.reducer";

export const averagesFeature = createFeature({
   name: "averages",
   reducer: averagesReducer
});
