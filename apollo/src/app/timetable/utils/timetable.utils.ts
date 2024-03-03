import { Interval, Semester } from "@apollo-timetable/models";

export class TimetableUtils {
   public static getDisplayableDays(semester?: Semester): Interval {
      if(!semester) {
         return {
            start: 0,
            end: 0,
            count: 0
         };
      }

      let firstDay = 7, lastDay = 1;
      semester.activities.forEach(activity => {
         if(activity.time.day < firstDay) {
            firstDay = activity.time.day;
         }
         if(activity.time.day > lastDay) {
            lastDay = activity.time.day;
         }
      });

      return {
         start: firstDay,
         end: lastDay,
         count: lastDay - firstDay + 1
      };
   }

   public static getDisplayableHours(semester?: Semester): Interval {
      if(!semester) {
         return {
            start: 0,
            end: 0,
            count: 0
         };
      }

      let firstHour = 23, lastHour = 0;
      semester.activities.forEach(activity => {
         if(activity.time.startingHour < firstHour) {
            firstHour = activity.time.startingHour;
         }
         const endingHour = activity.time.startingHour + Math.floor(activity.time.length / 60);
         if(endingHour > lastHour) {
            lastHour = endingHour;
         }
      });

      return {
         start: firstHour,
         end: lastHour,
         count: lastHour - firstHour + 1
      };
   }
}
