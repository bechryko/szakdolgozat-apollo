import { Pipe, PipeTransform } from '@angular/core';
import { UniversitySubject } from '@apollo/shared/models';
import { partition } from 'lodash';

@Pipe({
   name: 'creditSum',
   standalone: true
})
export class CreditSumPipe implements PipeTransform {
   public transform(subjects: UniversitySubject[]): [ number, number ] {
      return partition(subjects, subject => !subject.isTalentManager).map(
         subjects => subjects.reduce((sum, subject) => sum + subject.credit, 0)
      ) as [ number, number ];
   }
}
