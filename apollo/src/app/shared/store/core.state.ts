import { University, UniversityCompletionYear, UniversitySubject } from "../models";

export interface CoreState {
   completions: UniversityCompletionYear[] | null;
   universities: University[] | null;
   universitySubjects: UniversitySubject[] | null;
}
