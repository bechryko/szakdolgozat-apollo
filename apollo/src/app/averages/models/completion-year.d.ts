import { Grade } from "./grade";

export interface CompletionYear {
   name: string;
   firstSemesterGrades: Grade[];
   secondSemesterGrades: Grade[];
}
