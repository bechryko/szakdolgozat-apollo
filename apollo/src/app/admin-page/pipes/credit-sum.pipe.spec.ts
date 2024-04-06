import { UniversitySubject } from "@apollo/shared/models";
import { CreditSumPipe } from "./credit-sum.pipe";

describe('CreditSumPipe', () => {
   let pipe: CreditSumPipe;
   
   const subjects = [
      { credit: 1, isTalentManager: false },
      { credit: 2, isTalentManager: true },
      { credit: 3, isTalentManager: false },
      { credit: 4, isTalentManager: true },
   ] as UniversitySubject[];

   beforeEach(() => {
      pipe = new CreditSumPipe();
   });

   it("should return the sum of the non-talent-manager subjects' credits", () => {
      expect(pipe.transform(subjects)).toEqual([ 4, jasmine.any(Number) ]);
   });

   it("should return the sum of the talent-manager subjects' credits", () => {
      expect(pipe.transform(subjects)).toEqual([ jasmine.any(Number), 6 ]);
   });
});
