//@index('./*.pipe.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { AsAnyPipe } from './as-any.pipe';
export { CurrencyPipe } from './currency.pipe';
export { DisplayValuePipe } from './display-value.pipe';
export { GetSubjectsPipe } from './get-subjects.pipe';
export { PluckPipe } from './pluck.pipe';
//@endindex
