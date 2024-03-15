import { AlternativeGrade, Grade } from "../models";

export class AveragesUtils {
   public static areAlternativeGradesChanged(grades: Grade[], alternatives: AlternativeGrade[]): boolean {
      if(alternatives.length !== grades.length) {
         return true;
      }

      for(let i = 0; i < grades.length; i++) {
         const alternative = alternatives[i];
         const grade = grades[i];

         if(alternative.disabled) {
            return true;
         }

         if(grade.rating !== alternative.rating) {
            return true;
         }
      }

      return false;
   }
}
