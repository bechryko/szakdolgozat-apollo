import { newCompletionDefaultRating } from "../constants";
import { UniversityCompletionYear } from "../models";
import { CompletionsUtils } from "./completions.utils";

describe('CompletionsUtils', () => {
   describe('addToUnassignedCompletionsCollector', () => {
      it("should add a subject to the unassigned completions collector if it exists", () => {
         const unassignedCompletionsCollector: UniversityCompletionYear = {
            id: "1",
            name: "unassignedCompletionsCollector",
            owner: "",
            firstSemester: [],
            secondSemester: [],
            isUnassignedCompletionsCollector: true
         };
         const subject = {
            name: 'Subject 1',
            code: '1',
            credit: 6
         };
         const completionYearsArray: UniversityCompletionYear[] = [];
         
         CompletionsUtils.addToUnassignedCompletionsCollector(unassignedCompletionsCollector, subject, completionYearsArray);
         
         expect(completionYearsArray.length).toBe(0);
         expect(unassignedCompletionsCollector).toEqual({
            ...unassignedCompletionsCollector,
            firstSemester: [
               {
                  ...subject,
                  rating: newCompletionDefaultRating
               }
            ]
         });
      });

      it("should create a new unassigned completions collector and add a subject to it if it doesn't exist", () => {
         const unassignedCompletionsCollector = undefined;
         const subject = {
            name: 'Subject 1',
            code: '1',
            credit: 6
         };
         const completionYearsArray: UniversityCompletionYear[] = [];
         
         CompletionsUtils.addToUnassignedCompletionsCollector(unassignedCompletionsCollector, subject, completionYearsArray);
         
         expect(completionYearsArray.length).toBe(1);
         expect(completionYearsArray[0].firstSemester).toEqual([
            {
               ...subject,
               rating: newCompletionDefaultRating
            }
         ]);
         expect(completionYearsArray[0].isUnassignedCompletionsCollector).toBeTrue();
      });
   });
});
