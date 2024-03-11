import { Grade } from "./grade";

export interface GradesCompletionYear {
   id: string;
   name: string;
   owner: string;
   firstSemesterGrades: Grade[];
   secondSemesterGrades: Grade[];
}
