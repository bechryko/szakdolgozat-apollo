import { Semester } from "@apollo-timetable/models";

export interface TimetableSettingsDialogData {
   semesters?: Semester[];
   selectedSemester?: Semester;
}
