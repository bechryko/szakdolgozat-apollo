import { Pipe, PipeTransform } from '@angular/core';
import { leadingZeros } from '@apollo/shared/functions';
import { ActivityTime } from '../../models';

@Pipe({
   name: 'endTime',
   standalone: true
})
export class EndTimePipe implements PipeTransform {
   public transform(time: ActivityTime): Record<string, any> {
      let hour = time.startingHour;
      let minute = time.startingMinute + time.length;

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
