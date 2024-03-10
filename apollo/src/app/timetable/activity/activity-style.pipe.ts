import { Pipe, PipeTransform } from '@angular/core';
import { isColorDark } from '@apollo/shared/functions';
import { Activity, ActivityCategory, TimetableSizeData } from '../models';

@Pipe({
   name: 'activityStyle',
   standalone: true
})
export class ActivityStylePipe implements PipeTransform {
   private readonly TEMPORARY_ACTIVITY_OPACITY = 0.65;

   public transform(timetableSizeData: TimetableSizeData, activity: Activity, categories: ActivityCategory[]): Record<string, string> {
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
         const topPos = Math.round((activity.time.startingHour - timetableSizeData.startingHour + activity.time.startingMinute / 60) * timetableSizeData.hourHeight);
         style['top'] = `${ topPos }px`;
         style['height'] = `${ Math.round(activity.time.length / 60 * timetableSizeData.hourHeight) }px`;
         const category = this.getCategory(activity, categories);
         style['background-color'] = category?.color || 'white';
         if(isColorDark(style['background-color'])) {
            style['color'] = 'white';
         }
         if(category?.temporary) {
            style['opacity'] = this.TEMPORARY_ACTIVITY_OPACITY.toString();
         }
         return style;
      } catch (error) {
         return {
            'display': 'none'
         };
      }
   }

   private getCategory(activity: Activity, categories: ActivityCategory[]): ActivityCategory | undefined {
      if(!activity.categoryName) {
         return undefined;
      }
      return categories.find(category => category.name === activity.categoryName);
   }
}
