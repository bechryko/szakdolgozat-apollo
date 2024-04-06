import { Grade, GradesCompletionYear } from "../models";
import { AverageCalculatorUtils } from "./average-calculator.utils";

describe('AverageCalculatorUtils', () => {
   const testGrades = [
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
         const result = AverageCalculatorUtils.calculateWeightedAverage(testGrades);
         
         expect(result).toBe(3.5);
      });
   });

   describe('sumCredits', () => {
      it('should sum credits', () => {
         const result = AverageCalculatorUtils.sumCredits(testGrades);
         
         expect(result).toBe(14);
      });
   });

   describe('calculateCreditIndex', () => {
      it('should calculate credit index for a semester', () => {
         const result = AverageCalculatorUtils.calculateCreditIndex(testGrades);
         
         expect(result).toBe(1.633);
      });
   });

   describe('calculateAdjustedCreditIndex', () => {
      it('should calculate adjusted credit index for a semester', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndex(testGrades);
         
         expect(result).toBe(1.4);
      });
   });

   describe('calculateCreditIndexForMultipleYears', () => {
      it('should calculate credit index for a single year', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears([ testYears[0] ]);
         
         expect(result).toBe(2.7);
      });

      it('should calculate credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(2.575);
      });
      
      it('should calculate credit index for a single year with a missing semester', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears([ missingSemesterTestYears[0] ]);
         
         expect(result).toBe(3.5);
      });

      it('should calculate credit index for multiple years with missing semesters', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(missingSemesterTestYears);
         
         expect(result).toBe(2.75);
      });
   });

   describe('calculateAdjustedCreditIndexForMultipleYears', () => {
      it('should calculate credit index for a single year', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears([ testYears[1] ]);
         
         expect(result).toBe(2.205);
      });

      it('should calculate adjusted credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(2.446);
      });
      
      it('should calculate credit index for a single year with a missing semester', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears([ missingSemesterTestYears[1] ]);
         
         expect(result).toBe(1.5);
      });

      it('should calculate adjusted credit index for multiple years with missing semesters', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(missingSemesterTestYears);
         
         expect(result).toBe(2.475);
      });
   });
});
