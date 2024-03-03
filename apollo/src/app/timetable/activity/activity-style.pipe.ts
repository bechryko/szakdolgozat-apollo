import { Pipe, PipeTransform } from '@angular/core';
import { isColorDark } from '@apollo-shared/functions';
import { Activity, TimetableSizeData } from '@apollo-timetable/models';

@Pipe({
   name: 'activityStyle',
   standalone: true
})
export class ActivityStylePipe implements PipeTransform {
   private readonly TEMPORARY_ACTIVITY_OPACITY = 0.65;

   public transform(timetableSizeData: TimetableSizeData, activity: Activity): Record<string, string> {
      try {
         const style: Record<string, string> = {};
         let leftPos = (activity.time.day - timetableSizeData.startingDay) * timetableSizeData.dayWidth;
         if(activity.locationInterval) {
            leftPos += activity.locationInterval.startPlace * timetableSizeData.dayWidth / activity.locationInterval.split;
         }
         style['left'] = `${ leftPos }px`;
         let width = timetableSizeData.dayWidth;
         if(activity.locationInterval) {
            width = activity.locationInterval.size * timetableSizeData.dayWidth / activity.locationInterval.split;
         }
         style['width'] = `${ width }px`;
         style['top'] = `${ (activity.time.startingHour - timetableSizeData.startingHour) * timetableSizeData.hourHeight }px`;
         style['height'] = `${ activity.time.length / 60 * timetableSizeData.hourHeight }px`;
         style['background-color'] = activity.category?.color || 'white';
         if(isColorDark(style['background-color'])) {
            style['color'] = 'white';
         }
         if(activity.category?.temporary) {
            style['opacity'] = this.TEMPORARY_ACTIVITY_OPACITY.toString();
         }
         return style;
      } catch (_) {
         return {
            'display': 'none'
         };
      }
   }
}
