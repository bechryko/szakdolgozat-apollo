import { UniversityMajorSubjectGroup } from "./university-major-subject-group";

export interface UniversityMajor {
   id: string;
   name: string;
   universityId: string;
   facultyId: number;
   subjectGroups: UniversityMajorSubjectGroup[];
}
