import { cloneDeep } from "lodash";
import { Activity, ActivityLocationInterval, Semester } from "../models";
import { TimetableUtils } from "./timetable.utils";

export class TimetableSplitUtils {
   public static splitTimetable(semester: Semester): Semester {
      const newSemester: Semester = {
         ...semester,
         activities: []
      };
      const { start, end } = TimetableUtils.getDisplayableDays(semester);
      for (let day = start; day <= end; day++) {
         const activities = semester.activities.filter(activity => activity.time.day === day);
         if (activities.length === 0) {
            continue;
         }
         newSemester.activities.push(...this.splitTimetableDay(cloneDeep(activities)));
      }
      return newSemester;
   }

   private static splitTimetableDay(activities: Activity[]): Activity[] {
      const sortedActivities = activities
         .sort((a, b) => a.name.localeCompare(b.name))
         .sort((a, b) => b.time.length - a.time.length);

      sortedActivities.forEach(activity => activity.locationInterval = undefined);

      sortedActivities.forEach(activity => this.calculateSplit(activity, sortedActivities));

      sortedActivities.forEach(activity => {
         const crossingActivities = this.getCrossingActivities(activity, sortedActivities);
         activity.locationInterval!.startPlace = this.getFirstAvailableLocationIntervalPlace(activity, ...crossingActivities);
         activity.locationInterval!.size = 1;
      });

      sortedActivities.forEach(activity => {
         for (; !this.isIntervalConflict(activity, ...this.getCrossingActivities(activity, activities)); activity.locationInterval!.size++);
         activity.locationInterval!.size--;
      });

      return sortedActivities;
   }

   private static calculateSplit(activity: Activity, activities: Activity[]): number {
      if (activity.locationInterval) {
         return activity.locationInterval.split;
      }

      activity.locationInterval = {
         split: this.activitiesWhenItStarts(activity, activities),
         startPlace: 0,
         size: 0
      };

      const crossingActivities = this.getCrossingActivities(activity, activities);

      const childCrosses = [];
      for (const cross of crossingActivities) {
         childCrosses.push(this.calculateSplit(cross, activities));
      }
      activity.locationInterval.split = Math.max(activity.locationInterval.split, ...childCrosses);

      for (const cross of crossingActivities) {
         this.suggestSplitValue(cross, activity.locationInterval.split, activities);
      }
      return activity.locationInterval.split;
   }

   private static getCrossingActivities(activity: Activity, activities: Activity[]): Activity[] {
      const startingMin = activity.time.startingHour * 60 + activity.time.startingMinute;
      const endingMin = startingMin + activity.time.length;

      return activities.filter(a => {
         if (a === activity) {
            return false;
         }
         
         const aStartingMin = a.time.startingHour * 60 + a.time.startingMinute;
         const aEndingMin = aStartingMin + a.time.length;
         
         return (aStartingMin <= startingMin && aEndingMin > startingMin) || (aStartingMin < endingMin && aEndingMin >= endingMin);
      });
   }

   private static activitiesWhenItStarts(activity: Activity, activities: Activity[]): number {
      let number = 0;
      const activityStartingMin = activity.time.startingHour * 60 + activity.time.startingMinute;
      activities.forEach(a => {
         const startingMin = a.time.startingHour * 60 + a.time.startingMinute;
         const endingMin = startingMin + a.time.length;
         if (startingMin <= activityStartingMin && endingMin > activityStartingMin) {
            number++;
         }
      });
      return number;
   }

   private static suggestSplitValue(activity: Activity, splitValue: number, activities: Activity[]): void {
      if (activity.locationInterval!.split >= splitValue) {
         return;
      }
      activity.locationInterval!.split = splitValue;
      activities.forEach(a => this.suggestSplitValue(a, splitValue, activities));
   }

   private static getFirstAvailableLocationIntervalPlace(...activities: Activity[]): number {
      const places = activities.filter(a => a.locationInterval?.size).map(a => a.locationInterval!.startPlace);
      let place = 0;
      while (places.includes(place)) {
         place++;
      }
      return place;
   }

   private static isIntervalConflict(activity: Activity, ...activities: Activity[]): boolean {
      if (activity.locationInterval!.startPlace + activity.locationInterval!.size > activity.locationInterval!.split) {
         return true;
      }

      const activityOccupiedPlaces = this.getOccupiedPlaces(activity.locationInterval!);
      for (const a of activities) {
         if (a === activity) {
            continue;
         }
         for (const place of this.getOccupiedPlaces(a.locationInterval!)) {
            if (activityOccupiedPlaces.has(place)) {
               return true;
            }
         }
      }
      return false;
   }

   private static getOccupiedPlaces(interval: ActivityLocationInterval): Set<number> {
      const places = new Set<number>();
      for (let i = interval.startPlace; i < interval.startPlace + interval.size; i++) {
         places.add(i);
      }
      return places;
   }
}
