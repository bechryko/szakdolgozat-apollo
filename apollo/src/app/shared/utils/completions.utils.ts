import { newCompletionDefaultRating } from "../constants";
import { UniversityCompletionYear, UniversitySubjectCompletion } from "../models";

export class CompletionsUtils {
   public static addToUnassignedCompletionsCollector(
      unassignedCompletionsCollector: UniversityCompletionYear | undefined,
      subject: Omit<UniversitySubjectCompletion, 'rating'> & { rating?: number },
      completionYearsArray: UniversityCompletionYear[]
   ): void {
      const subjectToSave = {
         name: subject.name,
         code: subject.code,
         rating: subject.rating ?? newCompletionDefaultRating,
         credit: subject.credit
      };

      if(unassignedCompletionsCollector) {
         unassignedCompletionsCollector.firstSemester.push(subjectToSave);
      } else {
         const newCompletionYear: UniversityCompletionYear = {
            id: "unassignedCompletionsCollector" + Date.now(),
            name: "unassignedCompletionsCollector",
            owner: "",
            firstSemester: [ subjectToSave ],
            secondSemester: [],
            isUnassignedCompletionsCollector: true
         };
         completionYearsArray.push(newCompletionYear);
      }
   }
}
