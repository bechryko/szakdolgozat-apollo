import { UniversityCompletionYear, UniversitySubject } from "@apollo/shared/models";

export interface CompletionManagerDialogData {
   completions: UniversityCompletionYear[];
   universitySubjects: UniversitySubject[];
}
