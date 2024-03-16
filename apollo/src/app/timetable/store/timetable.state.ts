import { Semester } from "../models";

export interface TimetableState {
   semesters: Semester[];
   selectedSemesterId: string | undefined;
}
