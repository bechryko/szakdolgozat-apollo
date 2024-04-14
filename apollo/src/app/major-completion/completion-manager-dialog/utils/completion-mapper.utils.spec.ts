import { UniversityCompletionYear, UniversitySubjectCompletion } from "@apollo/shared/models";
import { CompletionsUtils } from "@apollo/shared/utils";
import { CompletionYearSkeleton, ManagableSubjectCompletion } from "../models";
import { CompletionMapperUtils } from "./completion-mapper.utils";

describe('CompletionMapperUtils', () => {
   describe('mapCompletionYearsToManagableSubjectCompletions', () => {
      it("should map completion years to managable subject completions", () => {
         const years = [
            {
               id: '1',
               name: '2019',
               firstSemester: [
                  {
                     code: '1',
                     name: 'Subject 1',
                     credit: 6,
                     rating: 3
                  }
               ],
               secondSemester: [
                  {
                     code: '2',
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  }
               ]
            }
         ] as UniversityCompletionYear[];
         const expected = [
            {
               completionYearId: '1',
               completionYearName: '2019',
               isFirstSemesterCompletion: true,
               code: '1',
               name: 'Subject 1',
               credit: 6,
               rating: 3
            },
            {
               completionYearId: '1',
               completionYearName: '2019',
               isFirstSemesterCompletion: false,
               code: '2',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            }
         ] as ManagableSubjectCompletion[];

         const result = CompletionMapperUtils.mapCompletionYearsToManagableSubjectCompletions(years);

         expect(result).toEqual(expected);
      });

      it("should map unassigned completions correctly", () => {
         const years = [
            {
               isUnassignedCompletionsCollector: true,
               firstSemester: [
                  {
                     code: '1',
                     name: 'Subject 1',
                     credit: 6,
                     rating: 3
                  },
                  {
                     code: '2',
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  }
               ]
            }
         ] as UniversityCompletionYear[];
         const expected = [
            {
               completionYearId: null,
               code: '1',
               name: 'Subject 1',
               credit: 6,
               rating: 3
            },
            {
               completionYearId: null,
               code: '2',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            }
         ] as ManagableSubjectCompletion[];

         const result = CompletionMapperUtils.mapCompletionYearsToManagableSubjectCompletions(years);

         expect(result).toEqual(expected);
      });
   });

   describe('mapCompletionYearsToCompletionYearSkeletons', () => {
      it("should map completion years to completion year skeletons", () => {
         const completions = [
            {
               id: '1',
               name: '2019',
               firstSemester: [] as UniversitySubjectCompletion[],
               secondSemester: [] as UniversitySubjectCompletion[]
            },
            {
               id: '2',
               name: '2020',
               firstSemester: [],
               secondSemester: []
            }
         ] as UniversityCompletionYear[];
         const expected = [
            {
               id: '1',
               name: '2019'
            },
            {
               id: '2',
               name: '2020'
            }
         ] as CompletionYearSkeleton[];

         const result = CompletionMapperUtils.mapCompletionYearsToCompletionYearSkeletons(completions);

         expect(result).toEqual(expected);
      });

      it("should filter out unassigned completions collector", () => {
         const completions = [
            {
               id: '1',
               name: '2019',
               firstSemester: [] as UniversitySubjectCompletion[],
               secondSemester: [] as UniversitySubjectCompletion[]
            },
            {
               isUnassignedCompletionsCollector: true,
               firstSemester: [] as UniversitySubjectCompletion[],
               secondSemester: [] as UniversitySubjectCompletion[]
            }
         ] as UniversityCompletionYear[];
         const expected = [
            {
               id: '1',
               name: '2019'
            }
         ] as CompletionYearSkeleton[];

         const result = CompletionMapperUtils.mapCompletionYearsToCompletionYearSkeletons(completions);

         expect(result).toEqual(expected);
      });

      it("should order by name", () => {
         const completions = [
            {
               id: '2',
               name: '2020',
               firstSemester: [] as UniversitySubjectCompletion[],
               secondSemester: [] as UniversitySubjectCompletion[]
            },
            {
               id: '1',
               name: '2019',
               firstSemester: [] as UniversitySubjectCompletion[],
               secondSemester: [] as UniversitySubjectCompletion[]
            }
         ] as UniversityCompletionYear[];
         const expected = [
            {
               id: '1',
               name: '2019'
            },
            {
               id: '2',
               name: '2020'
            }
         ] as CompletionYearSkeleton[];

         const result = CompletionMapperUtils.mapCompletionYearsToCompletionYearSkeletons(completions);

         expect(result).toEqual(expected);
      });
   });

   describe('mapManagableSubjectCompletionsToCompletionYears', () => {
      const owner = "testOwner";

      it("should map managable subject completions to completion years", () => {
         const completions = [
            {
               completionYearId: '1',
               completionYearName: '2019',
               isFirstSemesterCompletion: true,
               code: '1',
               name: 'Subject 1',
               credit: 6,
               rating: 3
            },
            {
               completionYearId: '1',
               completionYearName: '2019',
               isFirstSemesterCompletion: false,
               name: 'Subject 2',
               credit: 4,
               rating: 4
            }
         ] as ManagableSubjectCompletion[];
         const expected = [
            {
               id: '1',
               name: '2019',
               owner,
               firstSemester: [
                  {
                     code: '1',
                     name: 'Subject 1',
                     credit: 6,
                     rating: 3
                  }
               ],
               secondSemester: [
                  {
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  }
               ]
            }
         ] as UniversityCompletionYear[];

         const result = CompletionMapperUtils.mapManagableSubjectCompletionsToCompletionYears(completions, owner);

         expect(result).toEqual(expected);
      });

      it("should map unassigned completion", () => {
         const completions = [
            {
               completionYearId: null,
               code: '1',
               name: 'Subject 1',
               credit: 6,
               rating: 3
            },
            {
               completionYearId: null,
               code: '2',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            }
         ] as ManagableSubjectCompletion[];
         const addToUnassignedCompletionsCollectorSpy = spyOn(CompletionsUtils, 'addToUnassignedCompletionsCollector');
         
         CompletionMapperUtils.mapManagableSubjectCompletionsToCompletionYears(completions, owner);

         expect(addToUnassignedCompletionsCollectorSpy).toHaveBeenCalledTimes(2);
      });
   });
});
