import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'includes',
   standalone: true
})
export class IncludesPipe implements PipeTransform {
   public transform<T>(array: T[], element: T): boolean {
      return array.includes(element);
   }
}
