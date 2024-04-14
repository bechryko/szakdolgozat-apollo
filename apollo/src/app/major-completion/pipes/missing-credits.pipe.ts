import { Pipe, PipeTransform } from '@angular/core';
import { UniversityCompletionYear, UniversityMajor, UniversityMajorSubjectGroup, UniversitySpecialization, UniversitySpecializationSubjectGroup, UniversitySubjectCompletion } from '@apollo/shared/models';
import { sum, sumBy } from 'lodash';

type CreditRequiredValue = UniversityMajorSubjectGroup | UniversitySpecializationSubjectGroup | UniversitySpecialization | UniversityMajor;;

@Pipe({
   name: 'missingCredits',
   standalone: true
})
export class MissingCreditsPipe implements PipeTransform {
   public transform(value: CreditRequiredValue, completions: UniversityCompletionYear[]): number {
      if("subjects" in value) {
         return Math.max(0, this.transformMajorSubjectGroup(value, completions));
      } else if ("subGroups" in value) {
         return Math.max(0, this.transformSpecializationGroup(value, completions));
      } else if("groups" in value) {
         return Math.max(0, this.transformSpecialization(value, completions));
      } else {
         return Math.max(0, this.transformMajor(value, completions));
      }
   }

   private transformMajorSubjectGroup(group: UniversityMajorSubjectGroup, completions: UniversityCompletionYear[]): number {
      const allCompletions = completions.reduce((acc, completion) => [...acc, ...completion.firstSemester, ...completion.secondSemester], [] as UniversitySubjectCompletion[]);
      const completedSubjects = allCompletions.filter(completion => group.subjects.some(subject => subject.code === completion.code));
      const completedCredits = sumBy(completedSubjects, 'credit');
      return group.creditRequirement - completedCredits;
   }

   private transformSpecializationGroup(group: UniversitySpecializationSubjectGroup, completions: UniversityCompletionYear[]): number {
      const allCompletions = completions.reduce((acc, completion) => [...acc, ...completion.firstSemester, ...completion.secondSemester], [] as UniversitySubjectCompletion[]);
      const allSubjectsInGroup = group.subGroups.map(subGroup => subGroup.subjects).flat();
      const completedSubjects = allCompletions.filter(completion => allSubjectsInGroup.some(subject => subject.code === completion.code));
      const completedCredits = sumBy(completedSubjects, 'credit');
      return group.creditRequirement - completedCredits;
   }

   private transformSpecialization(specialization: UniversitySpecialization, completions: UniversityCompletionYear[]): number {
      return sum(specialization.groups.map(group => this.transformSpecializationGroup(group, completions)));
   }

   private transformMajor(major: UniversityMajor, completions: UniversityCompletionYear[]): number {
      const allCompletions = completions.reduce((acc, completion) => [...acc, ...completion.firstSemester, ...completion.secondSemester], [] as UniversitySubjectCompletion[]);
      const allSubjectsInGroup = major.subjectGroups.map(group => group.subjects).flat();
      const completedSubjects = allCompletions.filter(completion => allSubjectsInGroup.some(subject => subject.code === completion.code));
      const completedCredits = sumBy(completedSubjects, 'credit');
      return major.creditRequirement - completedCredits;
   }
}
