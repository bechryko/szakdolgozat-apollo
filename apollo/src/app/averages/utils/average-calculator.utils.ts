import { round } from "lodash";
import { Grade, GradesCompletionYear } from "../models";

export class AverageCalculatorUtils {
   public static calculateWeightedAverage(grades: Grade[]): number {
      const totalCredits = grades.reduce((acc, grade) => {
         if(grade.rating === 1) {
            return acc;
         } else {
            return acc + grade.credit;
         }
      }, 0);
      const totalWeightedGrades = grades.reduce((acc, grade) => {
         if(grade.rating === 1) {
            return acc;
         } else {
            return acc + (grade.rating * grade.credit);
         }
      }, 0);
      return round(totalWeightedGrades / totalCredits, 3);
   }

   public static sumCredits(grades: Grade[]): number {
      return grades.reduce((acc, grade) => acc + grade.credit, 0);
   }

   public static calculateCreditIndex(grades: Grade[], semesterNumber = 1): number {
      return round(this.calculateUnroundedCreditIndex(grades, semesterNumber), 3);
   }

   private static calculateUnroundedCreditIndex(grades: Grade[], semesterNumber: number): number {
      const totalWeightedGrades = grades.reduce((acc, grade) => acc + (grade.rating * grade.credit), 0);
      return totalWeightedGrades / (30 * semesterNumber);
   }

   public static calculateAdjustedCreditIndex(grades: Grade[], semesterNumber = 1): number {
      return round(this.calculateUnroundedCreditIndex(grades, semesterNumber) * this.calculateAdjustmentFactor(grades), 3);
   }

   private static calculateAdjustmentFactor(grades: Grade[]): number {
      const completedCredits = grades.filter(grade => grade.rating > 1).reduce((acc, grade) => acc + grade.credit, 0);
      const totalCredits = this.sumCredits(grades);
      return completedCredits / totalCredits;
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
