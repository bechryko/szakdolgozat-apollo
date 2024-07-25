import { EndTimePipe } from "./end-time.pipe";

describe('EndTimePipe', () => {
   let pipe: EndTimePipe;
   
   const activityTime = [9, 0, 90] as const;

   beforeAll(() => {
      pipe = new EndTimePipe();
   });

   it('should return the correct end time', () => {
      const resultTime = pipe.transform(...activityTime);

      const expected = {
         hour: "10",
         minute: "30"
      };
      expect(resultTime).toEqual(expected);
   });

   it('should return the correct end time with leading zeros', () => {
      const activityTime = [9, 0, 60] as const;

      const resultTime = pipe.transform(...activityTime);

      const expected = {
         hour: "10",
         minute: "00"
      };
      expect(resultTime).toEqual(expected);
   });
});
