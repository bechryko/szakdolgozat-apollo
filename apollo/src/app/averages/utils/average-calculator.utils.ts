import { round } from "lodash";
import { CreditSum, Grade, GradesCompletionYear } from "../models";

export class AverageCalculatorUtils {
   public static calculateWeightedAverage(grades: Grade[]): number {
      const completedCredits = this.sumCredits(grades).completed;
      const completedWeightedGrades = grades.reduce((acc, grade) => {
         if (grade.rating === 1) {
            return acc;
         } else {
            return acc + (grade.rating * grade.credit);
         }
      }, 0);
      return round(completedWeightedGrades / completedCredits, 3);
   }

   public static sumCredits(grades: Grade[]): CreditSum {
      const creditSum: CreditSum = {
         completed: 0,
         registered: 0
      };

      grades.forEach(grade => {
         if (grade.rating > 1) {
            creditSum.completed += grade.credit;
         }
         creditSum.registered += grade.credit;
      });

      return creditSum;
   }

   public static calculateCreditIndex(grades: Grade[], semesterNumber = 1): number {
      return round(this.calculateUnroundedCreditIndex(grades, semesterNumber), 3);
   }

   private static calculateUnroundedCreditIndex(grades: Grade[], semesterNumber: number): number {
      const completedWeightedGrades = grades.reduce((acc, grade) => {
         if (grade.rating === 1) {
            return acc;
         } else {
            return acc + (grade.rating * grade.credit);
         }
      }, 0);
      return completedWeightedGrades / (30 * semesterNumber);
   }

   public static calculateAdjustedCreditIndex(grades: Grade[], semesterNumber = 1): number {
      return round(this.calculateUnroundedCreditIndex(grades, semesterNumber) * this.calculateAdjustmentFactor(grades), 3);
   }

   private static calculateAdjustmentFactor(grades: Grade[]): number {
      const creditSum = this.sumCredits(grades);
      return creditSum.completed / creditSum.registered;
   }

   public static calculateAverage(...numbers: number[]): number {
      return round(numbers.reduce((acc, number) => acc + number, 0) / numbers.length, 3);
   }

   public static calculateCreditIndexForMultipleYears(years: GradesCompletionYear[]): number {
      let semesterNumber = 0;
      const grades = years.flatMap(year => {
         semesterNumber += Number(year.firstSemesterGrades.length > 0) + Number(year.secondSemesterGrades.length > 0);
         return year.firstSemesterGrades.concat(year.secondSemesterGrades);
      });
      return this.calculateCreditIndex(grades, semesterNumber);
   }

   public static calculateAdjustedCreditIndexForMultipleYears(years: GradesCompletionYear[]): number {
      let semesterNumber = 0;
      const grades = years.flatMap(year => {
         semesterNumber += Number(year.firstSemesterGrades.length > 0) + Number(year.secondSemesterGrades.length > 0);
         return year.firstSemesterGrades.concat(year.secondSemesterGrades);
      });
      return this.calculateAdjustedCreditIndex(grades, semesterNumber);
   }
}
