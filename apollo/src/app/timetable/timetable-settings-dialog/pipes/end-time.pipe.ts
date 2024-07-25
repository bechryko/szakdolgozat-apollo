import { Pipe, PipeTransform } from '@angular/core';
import { leadingZeros } from '@apollo/shared/functions';

@Pipe({
   name: 'endTime',
   standalone: true
})
export class EndTimePipe implements PipeTransform {
   public transform(startingHour: number, startingMinute: number, length: number): Record<string, any> {
      let hour = startingHour;
      let minute = startingMinute + length;

      while(minute >= 60) {
         hour++;
         minute -= 60;
      }

      return {
         hour: leadingZeros(hour, 2),
         minute: leadingZeros(minute, 2)
      };
   }
}
