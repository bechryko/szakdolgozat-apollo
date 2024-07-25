import { Pipe, PipeTransform } from '@angular/core';
import { ActivityTime } from '@apollo/timetable/models';
import { TimetableValidationUtils } from '../utils';

@Pipe({
   name: 'getActivityTimeErrors',
   standalone: true
})
export class GetActivityTimeErrorsPipe implements PipeTransform {
   public transform(startingHour: number, startingMinute: number, length: number): (keyof ActivityTime)[] {
      return TimetableValidationUtils.getActivityTimeErrors({ startingHour, startingMinute, length, day: -1 });
   }
}
