//@index('./*', (f, _) => `export { ${_.camelCase(f.name)} } from '${f.path}';`)
export { completionsActions } from './completions.actions';
export { universityMajorActions } from './university-major.actions';
export { universitySubjectActions } from './university-subject.actions';
export { universityActions } from './university.actions';
export { userActions } from './user.actions';
//@endindex
