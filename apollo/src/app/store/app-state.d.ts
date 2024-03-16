import { AveragesState } from "@apollo/averages/store";
import { MenuState } from "@apollo/menu/store";
import { CoreState } from "@apollo/shared/store";
import { TimetableState } from "@apollo/timetable/store";

export interface AppState {
   core: CoreState;
   menu: MenuState;
   timetable: TimetableState;
   averages: AveragesState;
}
