import { Row } from "read-excel-file";

export type TextParserFunction<T> = (exported: string) => T;
export type ExcelParserFunction<T> = (exported: Row[]) => T;

export type ParserFunction<T> = TextParserFunction<T> | ExcelParserFunction<T>;
