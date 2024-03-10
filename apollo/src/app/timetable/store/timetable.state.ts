import { Semester } from "@apollo-timetable/models";

export interface TimetableState {
   semesters: Semester[];
   selectedSemesterId: string | undefined;
}
