import { Pipe, PipeTransform } from '@angular/core';
import { AlternativeGrade, Grade } from '@apollo/averages/models';

@Pipe({
   name: 'cellStyle',
   standalone: true
})
export class CellStylePipe implements PipeTransform {
   public transform(grade: AlternativeGrade, original?: Grade): Record<string, boolean> {
      const classes: Record<string, boolean> = {};

      if(original && grade.rating !== original.rating) {
         classes['changed'] = true;
      }
      if(grade.disabled) {
         classes['disabled'] = true;
      }
      if(grade.bonus) {
         classes['bonus'] = true;
      }

      return classes;
   }
}
