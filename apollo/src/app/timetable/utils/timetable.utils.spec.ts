import { Activity } from "@apollo/timetable/models";
import { TimetableUtils } from "./timetable.utils";

describe('TimetableUtils', () => {
   describe('getDisplayableDays', () => {
      it('should return the correct interval', () => {
         const semester = {
            activities: [
               {
                  time: {
                     day: 1
                  }
               } as Activity,
               {
                  time: {
                     day: 3
                  }
               } as Activity,
               {
                  time: {
                     day: 5
                  }
               } as Activity
            ]
         } as any;

         const interval = TimetableUtils.getDisplayableDays(semester);
         expect(interval.start).toBe(1);
         expect(interval.end).toBe(5);
         expect(interval.count).toBe(5);
      });

      it('should return the correct interval for harder case', () => {
         const semester = {
            activities: [
               {
                  time: {
                     day: 6
                  }
               } as Activity,
               {
                  time: {
                     day: 2
                  }
               } as Activity,
               {
                  time: {
                     day: 3
                  }
               } as Activity,
               {
                  time: {
                     day: 5
                  }
               } as Activity
            ]
         } as any;

         const interval = TimetableUtils.getDisplayableDays(semester);
         expect(interval.start).toBe(2);
         expect(interval.end).toBe(6);
         expect(interval.count).toBe(5);
      });
   });

   describe('getDisplayableHours', () => {
      it('should return the correct interval (spec 1)', () => {
         const semester = {
            activities: [
               {
                  time: {
                     startingHour: 9,
                     startingMinute: 0,
                     length: 90
                  }
               } as Activity,
               {
                  time: {
                     startingHour: 8,
                     startingMinute: 30,
                     length: 60
                  }
               } as Activity,
               {
                  time: {
                     startingHour: 12,
                     startingMinute: 0,
                     length: 120
                  }
               } as Activity
            ]
         } as any;

         const interval = TimetableUtils.getDisplayableHours(semester);
         expect(interval.start).toBe(8);
         expect(interval.end).toBe(13);
         expect(interval.count).toBe(6);
      });

      it('should return the correct interval (spec 2)', () => {
         const semester = {
            activities: [
               {
                  time: {
                     startingHour: 9,
                     startingMinute: 0,
                     length: 90
                  }
               } as Activity,
               {
                  time: {
                     startingHour: 8,
                     startingMinute: 30,
                     length: 60
                  }
               } as Activity,
               {
                  time: {
                     startingHour: 12,
                     startingMinute: 0,
                     length: 120
                  }
               } as Activity,
               {
                  time: {
                     startingHour: 14,
                     startingMinute: 0,
                     length: 90
                  }
               } as Activity
            ]
         } as any;

         const interval = TimetableUtils.getDisplayableHours(semester);
         expect(interval.start).toBe(8);
         expect(interval.end).toBe(15);
         expect(interval.count).toBe(8);
      });
   });
});
