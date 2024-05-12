import { Grade } from "@apollo/averages/models";
import { Row } from "read-excel-file";
import { RawUniversitySubject, UniversityScholarshipData, UniversitySpecialization, UniversitySubject } from "../../models";
import { ExportMapperUtils } from "./export-mapper.utils";

interface TableSplitConfig {
   doNotFilterEmptyCells?: boolean;
   maxColumnNumber?: number;
   headerRows?: number;
}

export class TextParserUtils {
   public static parseSemesterGrades(exported: string): Grade[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 8,
         headerRows: 1
      });

      return ExportMapperUtils.mapToSemesterGrades(table);
   }

   public static parseUniversitySubjects(exported: string, existingSubjects?: RawUniversitySubject[]): RawUniversitySubject[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      return ExportMapperUtils.mapToUniversitySubjects(table, existingSubjects);
   }

   public static formatUniversityMajorData(exported: string): Row[] {
      return this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });
   }

   public static parseSpecializationsData(exported: string, subjects: UniversitySubject[]): UniversitySpecialization[] {
      const table = this.splitIntoTable(exported, {
         doNotFilterEmptyCells: true,
         maxColumnNumber: 52,
         headerRows: 2
      });

      return ExportMapperUtils.mapToSpecializations(table, subjects);
   }

   public static parseScholarshipData(exported: string): UniversityScholarshipData[] {
      const table = this.splitIntoTable(exported, {
         headerRows: 1
      });

      return ExportMapperUtils.mapToScholarshipData(table);
   }

   private static splitIntoTable(exported: string, config?: TableSplitConfig): Row[] {
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
}
