import { EndTimePipe } from "./end-time.pipe";

describe('EndTimePipe', () => {
   let pipe: EndTimePipe;
   
   const rawTime = {
      startingHour: '9',
      startingMinute: '0',
      length: '90'
   };

   beforeAll(() => {
      pipe = new EndTimePipe();
   });

   it('should return the correct end time', () => {
      const time = pipe.transform(rawTime);

      const expected = {
         hour: "10",
         minute: "30"
      };
      expect(time).toEqual(expected);
   });

   it('should return the correct end time with leading zeros', () => {
      const time = pipe.transform({
         startingHour: '9',
         startingMinute: '0',
         length: '60'
      });

      const expected = {
         hour: "10",
         minute: "00"
      };
      expect(time).toEqual(expected);
   });
});
