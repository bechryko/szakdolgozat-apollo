import { GradesCompletionYear } from "../models";
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
            { rating: 4, credit: 5 }
         ],
         secondSemesterGrades: [
            { rating: 3, credit: 4 }
         ]
      },
      {
         firstSemesterGrades: [
            { rating: 5, credit: 3 }
         ],
         secondSemesterGrades: [
            { rating: 1, credit: 2 }
         ]
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
      it('should calculate credit index', () => {
         const result = AverageCalculatorUtils.calculateCreditIndex(testGrades);
         
         expect(result).toBe(1.633);
      });
   });

   describe('calculateAdjustedCreditIndex', () => {
      it('should calculate adjusted credit index', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndex(testGrades);
         
         expect(result).toBe(1.4);
      });
   });

   describe('calculateCreditIndexForMultipleYears', () => {
      it('should calculate credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(1.633);
      });
   });

   describe('calculateAdjustedCreditIndexForMultipleYears', () => {
      it('should calculate adjusted credit index for multiple years', () => {
         const result = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(testYears);
         
         expect(result).toBe(1.4);
      });
   });
});
