export interface UniversityMajorSubjectGroupSubject {
   code: string;
   suggestedSemester?: number;
}

export interface UniversityMajorSubjectGroup {
   name: string;
   creditRequirement: number;
   subjects: UniversityMajorSubjectGroupSubject[];
}
