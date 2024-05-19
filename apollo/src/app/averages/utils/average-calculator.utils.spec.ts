import { Grade, GradesCompletionYear } from "../models";
import { AverageCalculatorUtils } from "./average-calculator.utils";

describe('AverageCalculatorUtils', () => {
   const testGrades1 = [
      { rating: 4, credit: 5 },
      { rating: 3, credit: 2 },
      { rating: 5, credit: 3 }
   ];

   const testGrades2 = [
      { rating: 4, credit: 5 },
      { rating: 3, credit: 4 },
      { rating: 5, credit: 3 },
      { rating: 1, credit: 2 }
   ];

   const testYears = [
      {
         firstSemesterGrades: [
            { rating: 4, credit: 10 },
            { rating: 2, credit: 10 },
            { rating: 3, credit: 10 }
         ],
         secondSemesterGrades: [
            { rating: 3, credit: 8 },
            { rating: 4, credit: 12 }
         ]
      },
      {
         firstSemesterGrades: [
            { rating: 3, credit: 10 },
            { rating: 2, credit: 10 },
            { rating: 4, credit: 5 },
            { rating: 1, credit: 5 }
         ],
         secondSemesterGrades: [
            { rating: 3, credit: 8 },
            { rating: 4, credit: 12 }
         ]
      }
   ] as GradesCompletionYear[];

   const missingSemesterTestYears = [
      {
         firstSemesterGrades: [] as Grade[],
         secondSemesterGrades: [
            { rating: 3, credit: 15 },
            { rating: 4, credit: 15 }
         ]
      },
      {
         firstSemesterGrades: [
            { rating: 3, credit: 5 },
            { rating: 4, credit: 10 },
            { rating: 1, credit: 5 },
         ],
         secondSemesterGrades: [] as Grade[]
      }
   ] as GradesCompletionYear[];

   describe('calculateWeightedAverage', () => {
      it('should calculate weighted average', () => {
         const result = AverageCalculatorUtils.calculateWeightedAverage(testGrades1);
         
         expect(result).toBe(4.1);
      });

      it('should avoid grades with rating 1', () => {
         const result = AverageCalculatorUtils.calculateWeightedAverage([
            ...testGrades1,
            { rating: 1, credit: 2 },
            { rating: 1, credit: 5 }
         ]);
         
         expect(result).toBe(4.1);
      });
   });

   describe('sumCredits', () => {
      it('should sum registered credits', () => {
         const result = AverageCalculatorUtils.sumCredits(testGrades2).registered;
         
         expect(result).toBe(14);
      });

      it('should sum completed credits', () => {
         const result = AverageCalculatorUtils.sumCredits(testGrades2).completed;
         
         expect(result).toBe(12);
      });
   });

   describe('calculateCreditIndex', () => {
      it('should calculate credit index for a semester', () => {
         const result = AverageCalculatorUtils.calculateCreditIndex(testGrades1);
         
         expect(result).toBe(1.367);
      });

      it('should avoid grades with rating 1', () => {
         const result = AverageCalculatorUtils.calculateCreditIndex(testGrades2);
         
         expect(result).toBe(1.567);
      });
   });

   describe('calculateAdjustedCreditIndex', () => {
      it('should calculate adjusted credit index for a semester', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndex(testGrades2);
         
         expect(result).toBe(1.343);
      });
   });

   describe('calculateCreditIndexForMultipleYears', () => {
      it('should calculate credit index for a single year', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears([ testYears[0] ]);
         
         expect(result).toBe(2.7);
      });

      it('should calculate credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(2.533);
      });
      
      it('should calculate credit index for a single year with a missing semester', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears([ missingSemesterTestYears[0] ]);
         
         expect(result).toBe(3.5);
      });

      it('should calculate credit index for multiple years with missing semesters', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(missingSemesterTestYears);
         
         expect(result).toBe(2.667);
      });
   });

   describe('calculateAdjustedCreditIndexForMultipleYears', () => {
      it('should calculate credit index for a single year', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears([ testYears[1] ]);
         
         expect(result).toBe(2.13);
      });

      it('should calculate adjusted credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(2.407);
      });
      
      it('should calculate credit index for a single year with a missing semester', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears([ missingSemesterTestYears[1] ]);
         
         expect(result).toBe(1.375);
      });

      it('should calculate adjusted credit index for multiple years with missing semesters', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(missingSemesterTestYears);
         
         expect(result).toBe(2.4);
      });
   });
});
