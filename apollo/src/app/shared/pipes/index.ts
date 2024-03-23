//@index('./*.pipe.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { DisplayValuePipe } from './display-value.pipe';
export { LanguageLabelKeyPipe } from './language-label-key.pipe';
export { MultiLanguagePipe } from './multi-language.pipe';
export { PluckPipe } from './pluck.pipe';
//@endindex
