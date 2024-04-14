import { Pipe, PipeTransform } from '@angular/core';
import { UniversityMajorSubjectGroupSubject, UniversitySubject } from '@apollo/shared/models';
import { TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';

interface ExtendedUniversitySubject extends UniversitySubject {
   suggestedSemester?: number;
}

@Pipe({
   name: 'getSubjects',
   standalone: true
})
export class GetSubjectsPipe implements PipeTransform {
   constructor(
      private readonly transloco: TranslocoService
   ) { }

   public transform(values: UniversityMajorSubjectGroupSubject[] | string[], subjects: UniversitySubject[]): ExtendedUniversitySubject[] {
      return values.map(value => {
         const code = typeof value === 'string' ? value : value.code;
         const subject: ExtendedUniversitySubject = cloneDeep(subjects.find(subject => subject.code === code)) ?? this.getDefaultSubject(code);
         if(typeof value !== 'string' && value.suggestedSemester) {
            subject.suggestedSemester = value.suggestedSemester;
         }
         return subject;
      }).sort((a, b) => a.name.localeCompare(b.name));
   }

   private getDefaultSubject(code: string): ExtendedUniversitySubject {
      return {
         code,
         name: this.transloco.translate("ADMINISTRATION.UNIVERSITY_DETAILS.MAJOR_DETAILS.MISSING_SUBJECT_NAME")
      } as ExtendedUniversitySubject;
   }
}
