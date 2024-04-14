import { Pipe, PipeTransform } from '@angular/core';
import { UniversityCompletionYear, UniversitySubject, UniversitySubjectCompletion } from '@apollo/shared/models';

@Pipe({
   name: 'filterCompleted',
   standalone: true
})
export class FilterCompletedPipe implements PipeTransform {
   public transform<T extends UniversitySubject>(subjects: T[], completions: UniversityCompletionYear[]): T[] {
      const allCompletions = completions.reduce((acc, completion) => [...acc, ...completion.firstSemester, ...completion.secondSemester], [] as UniversitySubjectCompletion[]);
      return subjects.filter(subject => !allCompletions.some(completion => completion.code === subject.code));
   }
}
