import { newCompletionDefaultRating } from "../constants";
import { UniversityCompletionYear, UniversitySubjectCompletion } from "../models";

export class CompletionsUtils {
   public static addToUnassignedCompletionsCollector(
      unassignedCompletionsCollector: UniversityCompletionYear | undefined,
      subject: Omit<UniversitySubjectCompletion, 'rating'>,
      completionYearsArray: UniversityCompletionYear[]
   ): void {
      if(unassignedCompletionsCollector) {
         unassignedCompletionsCollector.firstSemester.push({
            name: subject.name,
            code: subject.code,
            rating: 3,
            credit: subject.credit
         });
      } else {
         const newCompletionYear: UniversityCompletionYear = {
            id: "unassignedCompletionsCollector" + Date.now(),
            name: "unassignedCompletionsCollector",
            owner: "",
            firstSemester: [
               {
                  name: subject.name,
                  code: subject.code,
                  rating: newCompletionDefaultRating,
                  credit: subject.credit
               }
            ],
            secondSemester: [],
            isUnassignedCompletionsCollector: true
         };
         completionYearsArray.push(newCompletionYear);
      }
   }
}
