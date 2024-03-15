import { AlternativeGrade } from "./alternative-grade";
import { Grade } from "./grade";

export interface GradesCompletionYear {
   id: string;
   name: string;
   owner: string;
   firstSemesterGrades: Grade[];
   secondSemesterGrades: Grade[];
   alternativeGrades?: {
      firstSemester?: AlternativeGrade[];
      secondSemester?: AlternativeGrade[];
   };
}
