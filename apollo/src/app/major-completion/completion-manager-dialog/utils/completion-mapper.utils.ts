import { UniversityCompletionYear } from '@apollo/shared/models';
import { CompletionsUtils } from '@apollo/shared/utils';
import { orderBy } from 'lodash';
import { CompletionYearSkeleton, ManagableSubjectCompletion } from '../models';

export class CompletionMapperUtils {
   public static mapCompletionYearsToManagableSubjectCompletions(years: UniversityCompletionYear[]): ManagableSubjectCompletion[] {
      const completions: ManagableSubjectCompletion[] = [];

      years.forEach(year => {
         if(year.isUnassignedCompletionsCollector) {
            year.firstSemester.forEach(completion => {
               completions.push({
                  completionYearId: null,
                  ...completion
               });
            });
            return;
         }

         year.firstSemester.forEach(completion => {
            completions.push({
               completionYearId: year.id,
               completionYearName: year.name,
               isFirstSemesterCompletion: true,
               ...completion
            });
         });

         
         year.secondSemester.forEach(completion => {
            completions.push({
               completionYearId: year.id,
               completionYearName: year.name,
               isFirstSemesterCompletion: false,
               ...completion
            });
         });
      });

      return completions;
   }

   public static mapCompletionYearsToCompletionYearSkeletons(years: UniversityCompletionYear[]): CompletionYearSkeleton[] {
      return orderBy(
         years.filter(year => !year.isUnassignedCompletionsCollector).map(year => ({
            id: year.id,
            name: year.name
         })), 
         'name'
      );
   }

   public static mapManagableSubjectCompletionsToCompletionYears(
      completions: ManagableSubjectCompletion[],
      owner: string
   ): UniversityCompletionYear[] {
      const completionYears: UniversityCompletionYear[] = [];

      completions.forEach(completion => {
         if(completion.completionYearId === null) {
            const unassignedCompletionsCollector = completionYears.find(year => year.isUnassignedCompletionsCollector);
            CompletionsUtils.addToUnassignedCompletionsCollector(unassignedCompletionsCollector, completion, completionYears);
            return;
         }

         const completionYear = completionYears.find(year => year.id === completion.completionYearId);

         if (!completionYear) {
            completionYears.push({
               id: completion.completionYearId,
               name: completion.completionYearName,
               owner,
               firstSemester: [],
               secondSemester: []
            });
         }

         const targetYear = completionYears.find(year => year.id === completion.completionYearId)!;
         const targetSemeser = completion.isFirstSemesterCompletion ? targetYear.firstSemester : targetYear.secondSemester;
         const newCompletion = {
            name: completion.name,
            code: completion.code,
            credit: completion.credit,
            rating: completion.rating
         };
         if(!newCompletion.name) {
            delete newCompletion.name;
         }
         if(!newCompletion.code) {
            delete newCompletion.code;
         }
         targetSemeser.push(newCompletion);
      });

      return completionYears;
   }
}
