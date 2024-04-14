import { UniversitySubjectCompletion } from '@apollo/shared/models';

export interface NormalManagableSubjectCompletion extends UniversitySubjectCompletion {
   completionYearId: string;
   completionYearName: string;
   isFirstSemesterCompletion: boolean;
}

interface UnassignedManagableSubjectCompletion extends UniversitySubjectCompletion {
   completionYearId: null;
}

export type ManagableSubjectCompletion = NormalManagableSubjectCompletion | UnassignedManagableSubjectCompletion;
