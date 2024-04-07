import { Grade } from "@apollo/averages/models";
import { RawUniversitySubject, UniversityMajorSubjectGroup, UniversityScholarshipData, UniversitySpecialization, UniversitySubject } from "../../models";

interface TableSplitConfig {
   doNotFilterEmptyCells?: boolean;
   maxColumnNumber?: number;
   headerRows?: number;
}

export class NeptunExportParserUtils {
   private static SPECIAL_CHARACTER_REGEXP = /[$&+,:;=?@#|'<>.^*()%!-]/;

   public static parseSemesterGrades(exported: string): Grade[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 8,
         headerRows: 1
      });
      
      const grades: Grade[] = [];
      table.forEach(row => {
         if(row.length < 6) {
            return;
         }

         const code = row[0];
         const name = this.trimSpecialCharacters(row[1].split(',')[0]);
         const credit = Number(row[2]);
         const ratings = row[7].match(/(\d)/);
         if(!ratings?.length) {
            return;
         }
         const rating = Number(ratings[ratings.length - 1]);

         if(isNaN(credit) || isNaN(rating)) {
            return;
         }

         grades.push({ name, code, credit, rating });
      });

      return grades;
   }

   public static parseUniversitySubjects(exported: string, existingSubjects?: RawUniversitySubject[]): RawUniversitySubject[] {
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
         const isTalentManager = name.includes('tehetséggondozó program') || name.includes('Tehetséggondozás:');

         if(!code || isNaN(credit)) {
            return;
         }

         if(subjects.some(subject => subject.code === code)) {
            return;
         }
         
         const existingSubject = existingSubjects?.find(subject => subject.code === code);
         if(existingSubject) {
            if(name === existingSubject.name && credit === existingSubject.credit && isTalentManager === existingSubject.isTalentManager) {
               return;
            }
            existingSubjects?.splice(existingSubjects.indexOf(existingSubject), 1);
         }

         subjects.push({ name, code, credit, isTalentManager });
      });

      return subjects.sort((a, b) => a.name.localeCompare(b.name));
   }

   public static parseUniversityMajor(exported: string): UniversityMajorSubjectGroup[] {
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
            const nameCellIndex = this.findNameCellIndexInCurriculumRow(row);
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

   public static parseSpecializationsData(exported: string, subjects: UniversitySubject[]): UniversitySpecialization[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      const specializations: UniversitySpecialization[] = [];
      table.forEach(row => {
         const specializationName = row[16];
         if(!specializationName || !specializationName.includes('specializáció')) {
            return;
         }

         const groupName = row[26];
         const subGroupName = row[36];
         const subjectNameCellIndex = this.findNameCellIndexInCurriculumRow(row, 5);
         const code = row[subjectNameCellIndex - 1];

         if(!groupName || !subGroupName || !code || !subjects.find(subject => subject.code === code)) {
            return;
         }

         const existingSpecialization = specializations.find(specialization => specialization.name === specializationName);
         if(existingSpecialization) {
            const existingGroup = existingSpecialization.groups.find(group => group.name === groupName);
            if(existingGroup) {
               const existingSubGroup = existingGroup.subGroups.find(subGroup => subGroup.name === subGroupName);
               if(existingSubGroup) {
                  existingSubGroup.subjects.push({ code });
               } else {
                  existingGroup.subGroups.push({
                     name: subGroupName,
                     creditRequirement: 0,
                     subjects: [{ code }]
                  });
               }
            } else {
               existingSpecialization.groups.push({
                  name: groupName,
                  creditRequirement: 0,
                  subGroups: [ {
                     name: subGroupName,
                     creditRequirement: 0,
                     subjects: [{ code }]
                  } ]
               });
            }
         } else {
            specializations.push({
               name: specializationName,
               groups: [ {
                  name: groupName,
                  creditRequirement: 0,
                  subGroups: [ {
                     name: subGroupName,
                     creditRequirement: 0,
                     subjects: [{ code }]
                  } ]
               } ]
            });
         }
      });

      specializations.forEach(specialization => {
         specialization.groups.sort((a, b) => a.name.localeCompare(b.name));

         specialization.groups.forEach(group => {
            group.subGroups.sort((a, b) => a.name.localeCompare(b.name));
         });
      });

      return specializations;
   }

   public static parseScholarshipData(exported: string): UniversityScholarshipData[] {
      const table = this.splitIntoTable(exported, {
         headerRows: 1
      });

      const scholarships: UniversityScholarshipData[] = [];
      table.forEach(row => {
         const adjustedCreditIndex = Number(row[1]);
         const scholarshipAmount = Number(row[3]);
         const peopleEligible = Number(row[4].match(/(\d+)/)?.[0]);

         if(!adjustedCreditIndex || !scholarshipAmount || !peopleEligible) {
            return;
         }

         scholarships.push({ adjustedCreditIndex, scholarshipAmount, peopleEligible });
      });

      return scholarships;
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

   private static findNameCellIndexInCurriculumRow(row: string[], stepSize = 10): number {
      let idx = -1;
      for(let i = 6; i < row.length; i += stepSize) {
         if(row[i]) {
            idx = i - (stepSize - 5);
         }
      }
      return idx;
   }
}
