import { AlternativeGrade } from "./alternative-grade";
import { Grade } from "./grade";

export interface AlternativeSemester {
   id: string;
   type: 'firstSemesterGrades' | 'secondSemesterGrades';
   grades: AlternativeGrade[];
   original: Grade[];
}
