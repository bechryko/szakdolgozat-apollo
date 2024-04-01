import { UniversityMajorSubjectGroup } from "./university-major-subject-group";
import { UniversityScholarshipYear } from "./university-scholarship-year";
import { UniversitySpecialization } from "./university-specialization";

export interface UniversityMajor {
   id: string;
   name: string;
   universityId: string;
   facultyId: number;
   subjectGroups: UniversityMajorSubjectGroup[];
   scholarships?: UniversityScholarshipYear[];
   specializations?: UniversitySpecialization[];
}
