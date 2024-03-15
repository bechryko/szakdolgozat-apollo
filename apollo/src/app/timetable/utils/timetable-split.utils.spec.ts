import { ActivityLocationInterval, ActivityTime, Semester } from "@apollo/timetable/models";
import { TimetableSplitUtils } from "./timetable-split.utils";

function createSemester(...activityTimes: ActivityTime[]): Semester {
   return {
      activities: activityTimes.map(time => ({ time, name: "testActivity" }))
   } as Semester;
}

describe('TimetableSplitUtils', () => {
   describe('splitTimetable', () => {
      const defaultLocationInterval: ActivityLocationInterval = {
         split: 1,
         startPlace: 0,
         size: 1
      };

      it('should leave activities with no intersecting duration', () => {
         const semester = createSemester(
            { day: 1, startingHour: 8, startingMinute: 0, length: 120 },
            { day: 1, startingHour: 10, startingMinute: 0, length: 60 },
            { day: 2, startingHour: 8, startingMinute: 0, length: 60 }
         );

         const splitSemester = TimetableSplitUtils.splitTimetable(semester);

         expect(splitSemester.activities[0].locationInterval).toEqual(defaultLocationInterval);
         expect(splitSemester.activities[1].locationInterval).toEqual(defaultLocationInterval);
         expect(splitSemester.activities[2].locationInterval).toEqual(defaultLocationInterval);
      });

      it('should split two activities at the same time', () => {
         const semester = createSemester(
            { day: 1, startingHour: 8, startingMinute: 0, length: 60 },
            { day: 1, startingHour: 8, startingMinute: 0, length: 60 }
         );

         const splitSemester = TimetableSplitUtils.splitTimetable(semester);
         const expectedLocationInterval = {
            split: 2,
            startPlace: jasmine.any(Number),
            size: 1
         };

         expect(splitSemester.activities[0].locationInterval).toEqual(expectedLocationInterval);
         expect(splitSemester.activities[1].locationInterval).toEqual(expectedLocationInterval);

         const notInSamePlace = splitSemester.activities[0].locationInterval?.startPlace !== splitSemester.activities[1].locationInterval?.startPlace;
         expect(notInSamePlace).withContext("The activities are not in the same place").toBe(true);
      });

      it('should split more activities at the same time', () => {
         const activityCount = 40;

         const semester = createSemester(
            ...Array.from({ length: activityCount }, () => ({ day: 1, startingHour: 8, startingMinute: 0, length: 60 }))
         );

         const splitSemester = TimetableSplitUtils.splitTimetable(semester);
         const expectedLocationInterval = {
            split: activityCount,
            startPlace: jasmine.any(Number),
            size: 1
         };

         splitSemester.activities.forEach(activity => {
            expect(activity.locationInterval).toEqual(expectedLocationInterval);
         });

         const splitPlaces = new Set<number>();
         splitSemester.activities.forEach(activity => splitPlaces.add(activity.locationInterval?.startPlace!));
         expect(splitPlaces.size).withContext("The four activities are in four different place").toBe(activityCount);
      });

      it('should align splitted activities under each other', () => {
         const semester = createSemester(
            { day: 1, startingHour: 8, startingMinute: 0, length: 90 },
            { day: 1, startingHour: 9, startingMinute: 0, length: 90 },
            { day: 1, startingHour: 10, startingMinute: 0, length: 90 }
         );

         const splitSemester = TimetableSplitUtils.splitTimetable(semester);
         
         expect(splitSemester.activities[0].locationInterval).toEqual({ split: 2, startPlace: jasmine.any(Number), size: 1 });
         expect(splitSemester.activities[1].locationInterval).toEqual({ split: 2, startPlace: jasmine.any(Number), size: 1 });
         expect(splitSemester.activities[2].locationInterval).toEqual({ split: 2, startPlace: jasmine.any(Number), size: 1 });
         expect(splitSemester.activities[0].locationInterval?.startPlace === splitSemester.activities[2].locationInterval?.startPlace).withContext("The first and third activities are in the same place").toBe(true);
      });

      it('should expand activities which have more place', () => {
         const semester = createSemester(
            { day: 1, startingHour: 8, startingMinute: 0, length: 90 },
            { day: 1, startingHour: 8, startingMinute: 0, length: 60 },
            { day: 1, startingHour: 8, startingMinute: 0, length: 60 },
            { day: 1, startingHour: 9, startingMinute: 15, length: 60 }
         );

         const splitSemester = TimetableSplitUtils.splitTimetable(semester);

         expect(splitSemester.activities[3].locationInterval).toEqual({ split: 3, startPlace: jasmine.any(Number), size: 2 });
      });
   });
});
