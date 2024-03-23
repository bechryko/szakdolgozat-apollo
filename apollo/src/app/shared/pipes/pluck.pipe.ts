import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'pluck',
   standalone: true
})
export class PluckPipe implements PipeTransform {
   public transform<T, K extends keyof T>(array: T[], key: K): (T[K])[] {
      return array.map(item => item[key]);
   }
}
