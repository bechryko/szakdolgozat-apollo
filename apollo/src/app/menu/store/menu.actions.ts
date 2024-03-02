import { MenuCard } from "@apollo-menu/models";
import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const menuActions = createActionGroup({
   source: "Menu",
   events: {
      "Load cards": emptyProps(),
      "Load cards success": props<{ cards: MenuCard[] }>(),
   }
});
