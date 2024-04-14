import { UniversityCompletionYear, UniversitySubject } from "@apollo/shared/models";
import { FilterCompletedPipe } from "./filter-completed.pipe";

describe('FilterCompletedPipe', () => {
   let pipe: FilterCompletedPipe;

   const completions = [
      {
         firstSemester: [
            { code: '1' },
            { code: '2' }
         ],
         secondSemester: [
            { code: '4' },
            { code: '5' }
         ],
      }
   ] as UniversityCompletionYear[];

   beforeEach(() => {
      pipe = new FilterCompletedPipe();
   });

   it("should filter out the completed subjects", () => {
      const subjects = [
         { code: '1' },
         { code: '2' },
         { code: '3' },
         { code: '4' },
         { code: '5' },
         { code: '6' }
      ] as UniversitySubject[];
      const expected = [
         { code: '3' },
         { code: '6' }
      ] as UniversitySubject[];

      const result = pipe.transform(subjects, completions);

      expect(result).toEqual(expected);
   });
});
