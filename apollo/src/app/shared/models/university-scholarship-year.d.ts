export interface UniversityScholarshipData {
   adjustedCreditIndex: number;
   peopleEligible: number;
   scholarshipAmount: number;
}

export interface UniversityScholarshipYear {
   name: string;
   firstSemester: UniversityScholarshipData[];
   secondSemester: UniversityScholarshipData[];
}
