import { ActivityTime } from "@apollo/timetable/models";
import { EndTimePipe } from "./end-time.pipe";

describe('EndTimePipe', () => {
   let pipe: EndTimePipe;
   
   const activityTime = {
      startingHour: 9,
      startingMinute: 0,
      length: 90
   } as ActivityTime;

   beforeAll(() => {
      pipe = new EndTimePipe();
   });

   it('should return the correct end time', () => {
      const resultTime = pipe.transform(activityTime);

      const expected = {
         hour: "10",
         minute: "30"
      };
      expect(resultTime).toEqual(expected);
   });

   it('should return the correct end time with leading zeros', () => {
      const activityTime = {
         startingHour: 9,
         startingMinute: 0,
         length: 60
      } as ActivityTime;

      const resultTime = pipe.transform(activityTime);

      const expected = {
         hour: "10",
         minute: "00"
      };
      expect(resultTime).toEqual(expected);
   });
});
