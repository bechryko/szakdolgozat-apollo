import { Grade } from "@apollo/averages/models";

export class NeptunExportParserUtils {
   private static SPECIAL_CHARACTER_REGEXP = /[$&+,:;=?@#|'<>.^*()%!-]/;

   public static parseSemesterGrades(exported: string): Grade[] {
      const table = this.splitIntoTable(exported);
      
      const grades: Grade[] = [];
      table.forEach(row => {
         if(row.length < 6) {
            return;
         }
         const name = this.trimSpecialCharacters(row[1].split(',')[0]);
         const credit = Number(row[2]);
         const ratings = row[5].match(/(\d)/);
         if(!ratings?.length) {
            return;
         }
         const rating = Number(ratings[ratings.length - 1]);

         if(isNaN(credit) || isNaN(rating)) {
            return;
         }

         grades.push({ name, credit, rating });
      });

      return grades;
   }

   private static splitIntoTable(exported: string): string[][] {
      const lines = exported.split('\n');
      return lines.map(line => line.split('\t').filter(cell => cell.length));
   }

   private static trimSpecialCharacters(str: string): string {
      while(this.SPECIAL_CHARACTER_REGEXP.test(str[0])) {
         str = str.slice(1);
      }
      while(this.SPECIAL_CHARACTER_REGEXP.test(str[str.length - 1])) {
         str = str.slice(0, -1);
      }
      return str;
   }
}
