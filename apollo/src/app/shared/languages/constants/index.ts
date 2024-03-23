//@index('./*', (f, _) => `export { ${_.camelCase(f.name)} } from '${f.path}';`)
export { defaultLanguage } from './default-language';
export { fallbackLanguage } from './fallback-language';
export { languages } from './languages';
//@endindex
