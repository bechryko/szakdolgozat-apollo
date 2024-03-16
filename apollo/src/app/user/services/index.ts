//@index('./*.service.ts', (f, _) => `export { ${_.pascalCase(f.name)} } from '${f.path}';`)
export { AuthService } from './auth.service';
export { UserFetcherService } from './user-fetcher.service';
//@endindex
