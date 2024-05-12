import { Grade } from "@apollo/averages/models";
import { RawUniversitySubject, UniversityMajorSubjectGroup, UniversityScholarshipData, UniversitySpecialization, UniversitySubject } from "@apollo/shared/models";
import { Row } from "read-excel-file";

export class ExportMapperUtils {
   private static readonly SPECIAL_CHARACTER_REGEXP = /[$&+,:;=?@#|'<>.^*()%!-]/;
   private static readonly TALENT_MANAGER_KEYWORDS = ['tehetséggondozó program', 'tehetséggondozás'];

   public static mapToSemesterGrades(rows: Row[]): Grade[] {
      const grades: Grade[] = [];

      rows.forEach(row => {
         if(row.length < 6) {
            return;
         }

         const code = row[0].toString();
         const name = this.trimSpecialCharacters(row[1].toString().split(',')[0]);
         const credit = Number(row[2]);
         const ratings = row[7].toString().match(/(\d)/);
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

   public static mapToUniversitySubjects(rows: Row[], existingSubjects?: RawUniversitySubject[]): RawUniversitySubject[] {
      const subjects: RawUniversitySubject[] = [];

      rows.forEach(row => {
         const nameCellIndex = this.findNameCellIndexInCurriculumRow(row);
         if(nameCellIndex === -1 || !row[nameCellIndex]) {
            return;
         }

         const name = row[nameCellIndex].toString();
         const code = row[nameCellIndex - 1].toString();
         const credit = Number(row[nameCellIndex + 1]);
         const isTalentManager = this.TALENT_MANAGER_KEYWORDS.some(keyword => name.toLowerCase().includes(keyword));

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

   public static mapToUniversityMajor(rows: Row[]): UniversityMajorSubjectGroup[] {
      const groups: UniversityMajorSubjectGroup[] = [];

      rows.forEach(row => {
         const name = row[6].toString();
         if(!name) {
            return;
         }

         const existingGroup = groups.find(group => group.name === name);
         if(existingGroup) {
            const nameCellIndex = this.findNameCellIndexInCurriculumRow(row);
            if(nameCellIndex === -1 || !row[nameCellIndex]) {
               return;
            }
   
            const code = row[nameCellIndex - 1].toString();
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

   public static mapToSpecializations(rows: Row[], existingSubjects: UniversitySubject[]): UniversitySpecialization[] {
      const specializations: UniversitySpecialization[] = [];

      rows.forEach(row => {
         const specializationName = row[16].toString();
         if(!specializationName || !specializationName.includes('specializáció')) {
            return;
         }

         const groupName = row[26].toString();
         const subGroupName = row[36].toString();
         const subjectNameCellIndex = this.findNameCellIndexInCurriculumRow(row, 5);
         const code = row[subjectNameCellIndex - 1].toString();

         if(!groupName || !subGroupName || !code || !existingSubjects.find(subject => subject.code === code)) {
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

   public static mapToScholarshipData(rows: Row[]): UniversityScholarshipData[] {
      const scholarships: UniversityScholarshipData[] = [];

      rows.forEach(row => {
         const adjustedCreditIndex = Number(row[1]);
         const scholarshipAmount = Number(row[3]);
         const peopleEligible = Number(row[4].toString().match(/(\d+)/)?.[0]);

         if(!adjustedCreditIndex || !scholarshipAmount || !peopleEligible) {
            return;
         }

         scholarships.push({ adjustedCreditIndex, scholarshipAmount, peopleEligible });
      });

      return scholarships;
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
   
   private static findNameCellIndexInCurriculumRow(row: Row, stepSize = 10): number {
      let idx = -1;
      for(let i = 6; i < row.length; i += stepSize) {
         if(row[i]) {
            idx = i - (stepSize - 5);
         }
      }
      return idx;
   }
}
