import { GradesCompletionYear } from "@apollo/averages/models";

export interface GradeManagerDialogData {
   years: GradesCompletionYear[];
   selectedYearId?: string;
}
