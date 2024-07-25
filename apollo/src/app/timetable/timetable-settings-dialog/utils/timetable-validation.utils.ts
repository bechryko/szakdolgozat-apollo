import { ActivityTime } from "@apollo/timetable/models";

export class TimetableValidationUtils {
   public static getActivityTimeErrors(activityTime: ActivityTime): (keyof ActivityTime)[] {
      const errors: (keyof ActivityTime)[] = [];

      const activityEndTime = activityTime.startingHour * 60 + activityTime.startingMinute + activityTime.length;
      if (activityEndTime > 24 * 60 || activityTime.length === null) {
         errors.push("length");
      }
      if (activityTime.startingHour === 24 || activityTime.startingHour < 0 || activityTime.startingHour === null) {
         errors.push("startingHour");
      }
      if (activityTime.startingMinute < 0 || activityTime.startingMinute >= 60 || activityTime.startingMinute === null) {
         errors.push("startingMinute");
      }
      if (activityTime.length < 45 && !errors.includes("length")) { // TODO: fix length bug
         errors.push("length");
      }

      return errors;
   }
}