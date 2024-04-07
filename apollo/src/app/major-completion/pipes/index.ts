//@index('./*.pipe.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { FilterCompletedPipe } from './filter-completed.pipe';
export { MissingCreditsPipe } from './missing-credits.pipe';
//@endindex
