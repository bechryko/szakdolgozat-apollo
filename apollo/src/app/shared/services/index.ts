//@index('./*.service.ts', (f, _) => `export { ${ _.pascalCase(f.name) } } from '${f.path}';`)
export { CompletionsFetcherService } from './completions-fetcher.service';
export { CompletionsService } from './completions.service';
export { CoreFetcherService } from './core-fetcher.service';
export { RouterService } from './router.service';
export { SnackBarService } from './snack-bar.service';
export { TimeFormatService } from './time-format.service';
export { UniversitiesFetcherService } from './universities-fetcher.service';
export { UniversitiesService } from './universities.service';
export { UserService } from './user.service';
//@endindex
