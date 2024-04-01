import { Pipe, PipeTransform } from '@angular/core';
import { UniversityMajorSubjectGroupSubject, UniversitySubject } from '@apollo/shared/models';
import { TranslocoService } from '@ngneat/transloco';

@Pipe({
   name: 'getSubjects',
   standalone: true
})
export class GetSubjectsPipe implements PipeTransform {
   constructor(
      private readonly transloco: TranslocoService
   ) { }

   public transform(values: UniversityMajorSubjectGroupSubject[] | string[], subjects: UniversitySubject[]): UniversitySubject[] {
      return values.map(value => {
         const code = typeof value === 'string' ? value : value.code;
         const subject = subjects.find(subject => subject.code === code);
         return subject ?? this.getDefaultSubject(code);
      }).sort((a, b) => a.name.localeCompare(b.name));
   }

   private getDefaultSubject(code: string): UniversitySubject {
      return {
         code,
         name: this.transloco.translate("ADMINISTRATION.UNIVERSITY_DETAILS.MAJOR_DETAILS.MISSING_SUBJECT_NAME")
      } as UniversitySubject;
   }
}
