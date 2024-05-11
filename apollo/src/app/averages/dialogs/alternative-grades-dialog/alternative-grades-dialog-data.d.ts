import { AlternativeGrade, Grade } from '@apollo/averages/models';

export interface AlternativeGradesDialogOutputData {
   alternativeFirstSemesterGrades?: AlternativeGrade[];
   alternativeSecondSemesterGrades?: AlternativeGrade[];
}

export interface AlternativeGradesDialogData extends Partial<AlternativeGradesDialogOutputData> {
   yearName: string;
   originalFirstSemesterGrades: Grade[];
   originalSecondSemesterGrades: Grade[];
}
