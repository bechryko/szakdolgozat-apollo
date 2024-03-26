import { Grade } from "@apollo/averages/models";
import { RawUniversitySubject } from "../models";

interface TableSplitConfig {
   doNotFilterEmptyCells?: boolean;
   maxColumnNumber?: number;
   headerRows?: number;
}

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

   public static parseUniversitySubjects(exported: string): RawUniversitySubject[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      const subjects: RawUniversitySubject[] = [];
      table.forEach(row => {
         let nameCellIndex = -1;
         for(let i = 6; i < row.length; i += 10) {
            if(row[i]) {
               nameCellIndex = i - 5;
            }
         }
         if(nameCellIndex === -1 || !row[nameCellIndex]) {
            return;
         }

         const name = row[nameCellIndex];
         const code = row[nameCellIndex - 1];
         const credit = Number(row[nameCellIndex + 1]);
         const suggestedSemester = Number(row[nameCellIndex + 2]);

         if(!code || isNaN(credit)) {
            return;
         }

         const newSubject: RawUniversitySubject = { name, code, credit, suggestedSemester };
         if(!suggestedSemester) {
            delete newSubject.suggestedSemester;
         }
         subjects.push(newSubject);
      });

      return subjects;
   }

   private static splitIntoTable(exported: string, config?: TableSplitConfig): string[][] {
      const lines = exported.split('\n').slice(config?.headerRows ?? 0);
      const table = lines.map(line => line.split('\t'));

      if(Number(config?.maxColumnNumber) > 0) {
         return table.map(row => row.slice(0, config!.maxColumnNumber));
      }

      if(config?.doNotFilterEmptyCells) {
         return table;
      }

      return table.map(row => row.filter(cell => cell.length));
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
