//@index('./*.pipe.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { DisplayValuePipe } from './display-value.pipe';
export { PluckPipe } from './pluck.pipe';
//@endindex
