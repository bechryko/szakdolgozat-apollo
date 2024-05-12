import readXlsxFile from "read-excel-file";
import { ExcelParserFunction, ParserFunctionsWrapper, TextParserFunction } from "../models";

export class FileReadUtils {
   public static readFile<T>(file: File, parsers: ParserFunctionsWrapper<T>): Promise<T> {
      return new Promise((resolve, reject) => {
         if(!file) {
            reject("ERROR.FILE.NOT_FOUND");
            return;
         }

         const extension = file.name.split('.').pop();
         switch(extension) {
            case "txt":
               if(!parsers.txt) {
                  reject("ERROR.FILE.NO_AVAILABLE_PARSER");
                  return;
               }
               resolve(this.readTextFile(file, parsers.txt));
               return;
            case "xlsx":
               if(!parsers.xlsx) {
                  reject("ERROR.FILE.NO_AVAILABLE_PARSER");
                  return;
               }
               resolve(this.readExcelFile(file, parsers.xlsx));
               return;
            default:
               reject("ERROR.FILE.INVALID_FORMAT");
               return;
         }
      });
   }

   private static readTextFile<T>(file: File, parserFn: TextParserFunction<T>): Promise<T> {
      return new Promise((resolve) => {
         const fileReader = new FileReader();
         fileReader.onload = () => {
            const parsed = parserFn(fileReader.result as string);
            resolve(parsed);
         };
         fileReader.readAsText(file);
      });
   }

   private static async readExcelFile<T>(file: File, parserFn: ExcelParserFunction<T>): Promise<T> {
      const rows = await readXlsxFile(file);
      const parsed = parserFn(rows);
      return parsed;
   }
}