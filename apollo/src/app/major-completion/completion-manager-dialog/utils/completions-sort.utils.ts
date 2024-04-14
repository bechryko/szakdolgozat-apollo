import { orderSubject } from "@apollo/shared/functions";
import { TranslocoService } from "@ngneat/transloco";
import { CompletionGroup, ManagableSubjectCompletion, NormalManagableSubjectCompletion } from "../models";

export class CompletionsSortUtils {
   public static sortByYear(completions: ManagableSubjectCompletion[], transloco: TranslocoService): CompletionGroup[] {
      const completionGroups: CompletionGroup[] = [];

      completions.forEach(completion => {
         const completionGroupIndex = completionGroups.findIndex(year => {
            const isYearMatching = year.completions[0].completionYearId === completion.completionYearId;
            if(!isYearMatching) {
               return false;
            }
            if(completion.completionYearId === null) {
               return true;
            }

            const yearCompletion = year.completions[0] as NormalManagableSubjectCompletion;
            const isSemesterMatching = completion.isFirstSemesterCompletion === yearCompletion.isFirstSemesterCompletion;
            return isSemesterMatching;
         });

         if (completionGroupIndex === -1) {
            completionGroups.push({
               name: this.getCompletionGroupName(completion, transloco),
               completions: [completion]
            });
            return;
         }

         completionGroups[completionGroupIndex].completions.push(completion);
      });

      for(let i = 0; i < completionGroups.length; i++) {
         completionGroups[i].completions = orderSubject(completionGroups[i].completions);
      }

      return completionGroups;
   }

   private static getCompletionGroupName(completion: ManagableSubjectCompletion, transloco: TranslocoService): string | undefined {
      if(completion.completionYearId === null) {
         return;
      }

      const semesterPostfix = transloco.translate(
         completion.isFirstSemesterCompletion
            ? "GENERAL_PHRASE.FIRST_SEMESTER"
            : "GENERAL_PHRASE.SECOND_SEMESTER"
      );
      return `${ completion.completionYearName } (${ semesterPostfix })`;
   }
}
