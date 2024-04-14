//@index('./*.guard.ts', (f, _) => `export { ${_.camelCase(f.name)} } from '${f.path}';`)
export { adminGuard } from './admin.guard';
export { loginGuard } from './login.guard';
//@endindex
