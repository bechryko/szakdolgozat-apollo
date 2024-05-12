import { Grade } from "@apollo/averages/models";
import { RawUniversitySubject, UniversitySpecialization, UniversitySubject } from "@apollo/shared/models";
import { Row } from "read-excel-file";
import { ExportMapperUtils } from "./export-mapper.utils";

export class ExcelParserUtils {
   public static parseSemesterGrades(exported: Row[]): Grade[] {
      exported.splice(0, 1);
      return ExportMapperUtils.mapToSemesterGrades(exported);
   }

   public static parseUniversitySubjects(exported: Row[], existingSubjects?: RawUniversitySubject[]): RawUniversitySubject[] {
      exported.splice(0, 2);
      return ExportMapperUtils.mapToUniversitySubjects(exported, existingSubjects);
   }

   public static parseSpecializationsData(exported: Row[], existingSubjects: UniversitySubject[]): UniversitySpecialization[] {
      exported.splice(0, 2);
      return ExportMapperUtils.mapToSpecializations(exported, existingSubjects);
   }
}
