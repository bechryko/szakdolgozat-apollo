import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { MenuCard } from "../models";

export const menuActions = createActionGroup({
   source: "Menu",
   events: {
      "Load cards": emptyProps(),
      "Load cards success": props<{ cards: MenuCard[] }>(),
   }
});
