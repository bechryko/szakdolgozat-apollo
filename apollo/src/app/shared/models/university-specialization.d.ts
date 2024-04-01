import { UniversityMajorSubjectGroup } from "./university-major-subject-group";

export interface UniversitySpecializationSubjectGroup {
   name: string;
   creditRequirement: number;
   subGroups: UniversityMajorSubjectGroup[];
}

export interface UniversitySpecialization {
   name: string;
   groups: UniversitySpecializationSubjectGroup[];
}
