import { Grade } from "@apollo/averages/models";
import { RawUniversitySubject, UniversityMajorSubjectGroup, UniversitySubject } from "../../models";

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

   public static parseUniversitySubjects(exported: string, existingSubjects?: RawUniversitySubject[], forced = false): RawUniversitySubject[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      const subjects: RawUniversitySubject[] = [];
      table.forEach(row => {
         let nameCellIndex = this.findNameCellIndexInCurriculumRow(row);
         if(nameCellIndex === -1 || !row[nameCellIndex]) {
            return;
         }

         const name = row[nameCellIndex];
         const code = row[nameCellIndex - 1];
         const credit = Number(row[nameCellIndex + 1]);

         if(!code || isNaN(credit)) {
            return;
         }

         if(subjects.some(subject => subject.code === code)) {
            return;
         }
         const existingSubject = existingSubjects?.find(subject => subject.code === code);
         if(existingSubject) {
            if(!forced) {
               return;
            }
            existingSubjects = existingSubjects!.filter(subject => subject.code !== code);
         }

         subjects.push({ name, code, credit });
      });

      return subjects.sort((a, b) => a.name.localeCompare(b.name));
   }

   public static parseUniversityMajor(exported: string, subjects: UniversitySubject[]): UniversityMajorSubjectGroup[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      const groups: UniversityMajorSubjectGroup[] = [];
      table.forEach(row => {
         const name = row[6];
         if(!name) {
            return;
         }

         const existingGroup = groups.find(group => group.name === name);
         if(existingGroup) {
            let nameCellIndex = this.findNameCellIndexInCurriculumRow(row);
            if(nameCellIndex === -1 || !row[nameCellIndex]) {
               return;
            }
   
            const code = row[nameCellIndex - 1];
            const suggestedSemester = Number(row[nameCellIndex + 2]);
            
            existingGroup.subjects.push({ code, suggestedSemester });
         } else {
            const creditRequirement = Number(row[2]);

            const group: UniversityMajorSubjectGroup = {
               name,
               creditRequirement,
               subjects: []
            };

            groups.push(group);
         }
      });

      return groups;
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

   private static findNameCellIndexInCurriculumRow(row: string[]): number {
      let idx = -1;
      for(let i = 6; i < row.length; i += 10) {
         if(row[i]) {
            idx = i - 5;
         }
      }
      return idx;
   }
}
