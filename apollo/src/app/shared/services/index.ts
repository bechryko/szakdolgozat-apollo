//@index('./*.service.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { CompletionsFetcherService } from './completions-fetcher.service';
export { CompletionsService } from './completions.service';
export { CoreFetcherService } from './core-fetcher.service';
export { LanguageService } from './language.service';
export { SnackBarService } from './snack-bar.service';
export { TimeFormatService } from './time-format.service';
export { UserService } from './user.service';
//@endindex
