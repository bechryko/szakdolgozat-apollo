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

   public transform(values: UniversityMajorSubjectGroupSubject[], subjects: UniversitySubject[]): UniversitySubject[] {
      return values.map(value => {
         const subject = subjects.find(subject => subject.code === value.code);
         return subject ?? this.getDefaultSubject(value.code);
      }).sort((a, b) => a.name.localeCompare(b.name));
   }

   private getDefaultSubject(code: string): UniversitySubject {
      return {
         code,
         name: this.transloco.translate("ADMINISTRATION.UNIVERSITY_DETAILS.MAJOR_DETAILS.MISSING_SUBJECT_NAME")
      } as UniversitySubject;
   }
}
