import { Semester } from "../models";

export interface TimetableState {
   semesters: Semester[] | null;
   selectedSemesterId: string | undefined;
}
