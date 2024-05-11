import { Injectable } from '@angular/core';
import { UniversityCompletionYear, UniversitySubjectCompletion } from '@apollo/shared/models';
import { multicast } from '@apollo/shared/operators';
import { CompletionsService } from '@apollo/shared/services';
import { Store } from '@ngrx/store';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, map, switchMap, take, tap } from 'rxjs';
import { AlternativeSemester, Grade, GradesCompletionYear } from '../models';
import { averagesActions, averagesFeature } from '../store';

@Injectable({
   providedIn: 'root'
})
export class AveragesService {
   public readonly grades$: Observable<GradesCompletionYear[]>;
   private readonly alternatives$: Observable<AlternativeSemester[]>;

   constructor(
      private readonly completionsService: CompletionsService,
      private readonly store: Store
   ) {
      this.grades$ = this.completionsService.universityCompletions$.pipe(
         map(completions => completions.filter(completion => !completion.isUnassignedCompletionsCollector).map(completion => this.mapUniversityCompletionYearToGradesCompletionYear(completion))),
         switchMap(grades => this.alternatives$.pipe(
            tap(alternativeSemesters => this.checkAlternativeYearsChange(grades, alternativeSemesters)),
            map(alternatives => grades.map(grade => this.mapAlternativeYearToGradesCompletionYear(grade, alternatives)))
         )),
         multicast()
      );

      this.alternatives$ = this.store.select(averagesFeature.selectAlternativeSemesters);
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

   private checkAlternativeYearsChange(years: GradesCompletionYear[], alternatives: AlternativeSemester[]): void {
      alternatives.forEach(alternative => {
         const year = years.find(year => year.id === alternative.id);
         
         if (!year || !isEqual(year[alternative.type], alternative.original)) {
            this.removeAlternativeSemester(alternative);
         }
      });
   }

   private mapAlternativeYearToGradesCompletionYear(year: GradesCompletionYear, alternatives: AlternativeSemester[]): GradesCompletionYear {
      const alternativesForYear = alternatives.filter(alternative => alternative.id === year.id);
      const mappedYear = cloneDeep(year);

      if(alternativesForYear.length) {
         mappedYear.alternativeGrades = {};
      }

      alternativesForYear.forEach(alternative => {
         if(!alternative.grades.length) {
            return;
         }
         
         if (alternative.type === 'firstSemesterGrades') {
            mappedYear.alternativeGrades!.firstSemester = alternative.grades;
         } else {
            mappedYear.alternativeGrades!.secondSemester = alternative.grades;
         }
      });

      return mappedYear;
   }

   public saveAverages(averages: GradesCompletionYear[]): void {
      this.completionsService.universityCompletions$.pipe(
         take(1),
         map(completions => this.mapGradesCompletionYearsToUniversityCompletionYear(completions, averages))
      ).subscribe(completions => this.completionsService.saveUniversityCompletions(completions));
   }

   private mapGradesCompletionYearsToUniversityCompletionYear(completions: UniversityCompletionYear[], averages: GradesCompletionYear[]): UniversityCompletionYear[] {
      const universityCompletionYears: UniversityCompletionYear[] = [];

      completions.forEach(completion => {
         const average = averages.find(average => average.id === completion.id);
         if (!average) {
            universityCompletionYears.push(completion);
         } else {
            universityCompletionYears.push({
               ...completion,
               firstSemester: average.firstSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade)),
               secondSemester: average.secondSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade))
            });
         }
      });

      averages.filter(average => !completions.find(completion => completion.id === average.id)).forEach(average => {
         universityCompletionYears.push({
            id: average.id,
            name: average.name,
            owner: average.owner,
            firstSemester: average.firstSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade)),
            secondSemester: average.secondSemesterGrades.map(grade => this.mapGradeToUniversitySubjectCompletion(grade))
         });
      });

      return universityCompletionYears;
   }

   private mapGradeToUniversitySubjectCompletion(grade: Grade): UniversitySubjectCompletion {
      return {
         ...grade
      };
   }

   public saveAlternativeSemester(alternativeSemester: AlternativeSemester): void {
      this.store.dispatch(averagesActions.saveAlternativeSemester({ alternativeSemester }));
   }

   private removeAlternativeSemester(semester: AlternativeSemester): void {
      this.store.dispatch(averagesActions.removeAlternativeSemester({
         id: semester.id,
         semesterType: semester.type
      }));
   }

   public deleteGuestData(): void {
      this.completionsService.deleteGuestData();
   }
}
