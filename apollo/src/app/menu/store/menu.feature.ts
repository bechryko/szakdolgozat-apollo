import { createFeature } from "@ngrx/store";
import { menuReducer } from "./menu.reducer";

export const menuFeature = createFeature({
   name: "menu",
   reducer: menuReducer
});
