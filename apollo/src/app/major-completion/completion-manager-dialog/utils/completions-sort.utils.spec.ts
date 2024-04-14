import { TranslocoService } from "@ngneat/transloco";
import { CompletionGroup, ManagableSubjectCompletion } from "../models";
import { CompletionsSortUtils } from "./completions-sort.utils";

describe('CompletionsSortUtils', () => {
   const mockTransloco = jasmine.createSpyObj<TranslocoService>('TranslocoService', ['translate']);
   mockTransloco.translate.and.callFake(key => key as any);

   describe('sortByYear', () => {
      it("should group completions by their year and semester", () => {
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
               completionYearId: '2',
               completionYearName: '2020',
               isFirstSemesterCompletion: false,
               code: '2',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            },
            {
               completionYearId: '2',
               completionYearName: '2020',
               isFirstSemesterCompletion: true,
               code: '3',
               name: 'Subject 3',
               credit: 5,
               rating: 5
            }
         ] as ManagableSubjectCompletion[];
         const expected = [
            {
               name: jasmine.any(String) as any,
               completions: [
                  {
                     completionYearId: '1',
                     completionYearName: '2019',
                     isFirstSemesterCompletion: true,
                     code: '1',
                     name: 'Subject 1',
                     credit: 6,
                     rating: 3
                  }
               ]
            },
            {
               name: jasmine.any(String) as any,
               completions: [
                  {
                     completionYearId: '2',
                     completionYearName: '2020',
                     isFirstSemesterCompletion: false,
                     code: '2',
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  }
               ]
            },
            {
               name: jasmine.any(String) as any,
               completions: [
                  {
                     completionYearId: '2',
                     completionYearName: '2020',
                     isFirstSemesterCompletion: true,
                     code: '3',
                     name: 'Subject 3',
                     credit: 5,
                     rating: 5
                  }
               ]
            }
         ] as CompletionGroup[];

         const result = CompletionsSortUtils.sortByYear(completions, mockTransloco);

         expect(result).toEqual(expected);
      });

      it("should group unassigned completions correctly", () => {
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
         const expected = [
            {
               name: undefined,
               completions: [
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
               ]
            }
         ] as CompletionGroup[];

         const result = CompletionsSortUtils.sortByYear(completions, mockTransloco);

         expect(result).toEqual(expected);
      });

      it("should sort completions by their name and code", () => {
         const completions = [
            {
               completionYearId: '1',
               completionYearName: '2019',
               isFirstSemesterCompletion: true,
               code: '2',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            },
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
               isFirstSemesterCompletion: true,
               code: '0',
               name: 'Subject 2',
               credit: 4,
               rating: 4
            }
         ] as ManagableSubjectCompletion[];
         const expected = [
            {
               name: jasmine.any(String) as any,
               completions: [
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
                     isFirstSemesterCompletion: true,
                     code: '0',
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  },
                  {
                     completionYearId: '1',
                     completionYearName: '2019',
                     isFirstSemesterCompletion: true,
                     code: '2',
                     name: 'Subject 2',
                     credit: 4,
                     rating: 4
                  }
               ]
            }
         ] as CompletionGroup[];

         const result = CompletionsSortUtils.sortByYear(completions, mockTransloco);

         expect(result).toEqual(expected);
      });
   });
});
