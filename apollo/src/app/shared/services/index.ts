//@index('./*.service.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { LanguageService } from './language.service';
export { TimeFormatService } from './time-format.service';
export { UserService } from './user.service';
//@endindex
