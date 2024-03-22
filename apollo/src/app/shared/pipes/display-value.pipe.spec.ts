import { DisplayValuePipe } from "./display-value.pipe";

describe('DisplayValuePipe', () => {
   let pipe: DisplayValuePipe;
   let defaultEmptyValue: string;

   beforeEach(() => {
      pipe = new DisplayValuePipe();
      defaultEmptyValue = pipe["defaultEmptyValue"];
   });

   describe('transform', () => {
      it('should return the value if it is not falsy', () => {
         const value = 'value';

         expect(pipe.transform(value)).toEqual(value);
      });

      it('should return the default value if the value is empty', () => {
         const value = '';

         expect(pipe.transform(value)).toEqual(defaultEmptyValue);
      });

      it('should return the default value if the value is 0', () => {
         const value = 0;

         expect(pipe.transform(value)).toEqual(defaultEmptyValue);
      });

      it('should return the default value if the value is NaN', () => {
         const value = NaN;

         expect(pipe.transform(value)).toEqual(defaultEmptyValue);
      });

      it('should return the provided value if the value is falsy and the default value is provided', () => {
         const value = false;
         const valueIfEmptyData = 'valueIfEmptyData';

         expect(pipe.transform(value, valueIfEmptyData)).toEqual(valueIfEmptyData);
      });
   });
});
