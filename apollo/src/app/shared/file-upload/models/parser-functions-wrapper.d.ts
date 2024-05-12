import { ExcelParserFunction, TextParserFunction } from './parser-functions';

export interface ParserFunctionsWrapper<T> {
   txt?: TextParserFunction<T>;
   xlsx?: ExcelParserFunction<T>;
}
