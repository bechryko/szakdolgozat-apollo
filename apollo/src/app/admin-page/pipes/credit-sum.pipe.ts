import { Pipe, PipeTransform } from '@angular/core';
import { UniversitySubject } from '@apollo/shared/models';

@Pipe({
   name: 'creditSum',
   standalone: true
})
export class CreditSumPipe implements PipeTransform {
   public transform(subjects: UniversitySubject[]): number {
      return subjects.reduce((sum, value) => sum + value.credit, 0);
   }
}
