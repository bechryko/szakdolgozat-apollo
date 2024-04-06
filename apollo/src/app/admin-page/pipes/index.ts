//@index('./*.pipe.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { CreditSumPipe } from './credit-sum.pipe';
export { GetSubjectsPipe } from './get-subjects.pipe';
//@endindex
