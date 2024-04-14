import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'asAny',
   standalone: true
})
export class AsAnyPipe implements PipeTransform {
   public transform(value: unknown): any {
      return value;
   }
}
