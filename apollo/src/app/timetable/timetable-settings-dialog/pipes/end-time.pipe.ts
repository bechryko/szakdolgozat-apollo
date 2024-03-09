import { Pipe, PipeTransform } from '@angular/core';
import { numberize } from '@apollo-shared/functions';
import { ActivityTime } from '@apollo-timetable/models';

@Pipe({
   name: 'endTime',
   standalone: true
})
export class EndTimePipe implements PipeTransform {
   public transform(rawTime: Record<string, string>): Record<string, any> {
      const time = numberize<ActivityTime>(rawTime);

      let hour = time.startingHour;
      let minute = time.startingMinute + time.length;

      while(minute >= 60) {
         hour++;
         minute -= 60;
      }

      return {
         hour,
         minute
      };
   }
}
