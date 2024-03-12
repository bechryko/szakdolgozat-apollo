import { Injectable } from '@angular/core';
import { UniversityCompletionYear, UniversitySubjectCompletion } from '@apollo/shared/models';
import { multicast } from '@apollo/shared/operators';
import { CompletionsService } from '@apollo/shared/services';
import { Observable, map, take } from 'rxjs';
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

   public saveAverages(averages: GradesCompletionYear[]): void {
      this.completionsService.universityCompletions$.pipe(
         take(1),
         map(completions => completions.map(completion => this.mapGradesCompletionYearToUniversityCompletionYear(completion, averages)))
      ).subscribe(completions => this.completionsService.saveUniversityCompletions(completions));
   }

   private mapGradesCompletionYearToUniversityCompletionYear(completion: UniversityCompletionYear, averages: GradesCompletionYear[]): UniversityCompletionYear {
      const average = averages.find(average => average.id === completion.id);
      if(!average) {
         return completion;
      }

      return {
         ...completion,
         firstSemester: average.firstSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade)),
         secondSemester: average.secondSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade))
      };
   }

   private mapGradeToUniversitySubjectCompletion(grade: Grade): UniversitySubjectCompletion {
      return {
         ...grade
      };
   }
}
