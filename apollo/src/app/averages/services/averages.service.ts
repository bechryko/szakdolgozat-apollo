import { Injectable } from '@angular/core';
import { UniversityCompletionYear, UniversitySubjectCompletion } from '@apollo/shared/models';
import { multicast } from '@apollo/shared/operators';
import { CompletionsService } from '@apollo/shared/services';
import { Observable, map } from 'rxjs';
import { Grade, GradesCompletionYear } from '../models';

@Injectable({
   providedIn: 'root'
})
export class AveragesService {
   public readonly grades$: Observable<GradesCompletionYear[]>;

   constructor(
      private readonly completionsService: CompletionsService
   ) {
      this.grades$ = this.completionsService.universityCompletions$.pipe(
         map(completions => completions.map(completion => this.mapUniversityCompletionYearToGradesCompletionYear(completion))),
         multicast()
      );
   }

   private mapUniversityCompletionYearToGradesCompletionYear(completion: UniversityCompletionYear): GradesCompletionYear {
      return {
         id: completion.id,
         name: completion.name,
         owner: completion.owner,
         firstSemesterGrades: completion.firstSemester.map(subjectCompletion => this.mapUniversitySubjectCompletionToGrade(subjectCompletion)),
         secondSemesterGrades: completion.secondSemester.map(subjectCompletion => this.mapUniversitySubjectCompletionToGrade(subjectCompletion))
      };
   }

   private mapUniversitySubjectCompletionToGrade(completion: UniversitySubjectCompletion): Grade {
      return {
         ...completion
      };
   }
}
