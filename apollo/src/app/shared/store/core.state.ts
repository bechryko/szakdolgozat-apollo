import { University, UniversityCompletionYear, UniversityMajor, UniversitySubject } from "../models";

export interface CoreState {
   completions: UniversityCompletionYear[] | null;
   universities: University[] | null;
   universitySubjects: UniversitySubject[] | null;
   universityMajors: UniversityMajor[] | null;
}
