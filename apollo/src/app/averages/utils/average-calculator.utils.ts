import { Grade } from "../models";

export class AverageCalculatorUtils {
   public static calculateWeightedAverage(grades: Grade[]): number {
      const totalCredits = this.sumCredits(grades);
      const totalWeightedGrades = grades.reduce((acc, grade) => acc + (grade.rating * grade.credit), 0);
      return this.round(totalWeightedGrades / totalCredits);
   }

   public static sumCredits(grades: Grade[]): number {
      return grades.reduce((acc, grade) => acc + grade.credit, 0);
   }

   public static calculateCreditIndex(grades: Grade[]): number {
      return this.round(this.calculateUnroundedCreditIndex(grades));
   }

   private static calculateUnroundedCreditIndex(grades: Grade[]): number {
      const totalWeightedGrades = grades.reduce((acc, grade) => acc + (grade.rating * grade.credit), 0);
      return totalWeightedGrades / 30;
   }

   public static calculateAdjustedCreditIndex(grades: Grade[]): number {
      return this.round(this.calculateUnroundedCreditIndex(grades) * this.calculateAdjustmentFactor(grades));
   }

   private static calculateAdjustmentFactor(grades: Grade[]): number {
      const completedCredits = grades.filter(grade => grade.rating > 1).reduce((acc, grade) => acc + grade.credit, 0);
      const totalCredits = this.sumCredits(grades);
      return completedCredits / totalCredits;
   }

   public static calculateAverage(...numbers: number[]): number {
      return this.round(numbers.reduce((acc, number) => acc + number, 0) / numbers.length);
   }

   private static round(number: number, precision = 3): number {
      const factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
   }
}
