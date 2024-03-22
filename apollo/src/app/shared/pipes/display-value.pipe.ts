import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'displayValue',
   standalone: true
})
export class DisplayValuePipe implements PipeTransform {
   private readonly defaultEmptyValue = "⎯";

   public transform(value: unknown, valueIfEmptyData?: unknown): unknown {
      return Boolean(value) ? value : (valueIfEmptyData ?? this.defaultEmptyValue);
   }
}
