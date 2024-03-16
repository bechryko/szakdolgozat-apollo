import { UniversitySubjectCompletion } from "./university-subject-completion";

export interface UniversityCompletionYear {
   id: string;
   name: string;
   owner: string;
   firstSemester: UniversitySubjectCompletion[];
   secondSemester: UniversitySubjectCompletion[];
}
