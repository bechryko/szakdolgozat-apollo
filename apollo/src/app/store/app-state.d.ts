import { MenuState } from "@apollo-menu/store";
import { TimetableState } from "@apollo-timetable/store";

export interface AppState {
   menu: MenuState;
   timetable: TimetableState;
}
