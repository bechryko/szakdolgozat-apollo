import { Injectable } from "@angular/core";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs";
import { universitySubjectActions } from "../actions";

@Injectable()
export class UniversitySubjectEffects {
   public readonly loadUniversitySubjects$ = createEffect(() => 
      this.actions$.pipe(
         ofType(universitySubjectActions.loadUniversitySubjects),
         switchMap(({ universityId }) => this.universitiesFetcherService.getSubjectsForUniversity(universityId)),
         map(universitySubjects => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects })),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly saveUniversitySubjects$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveUniversitySubjects),
         switchMap(({ universitySubjects, universityId }) => this.universitiesFetcherService.saveUniversitySubjects(universitySubjects, universityId).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects }))
         )),
         tap(() => {
            this.snackBarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS");
         }),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly saveSingleUniversitySubject$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveSingleUniversitySubject),
         switchMap(({ universitySubject }) => this.universitiesFetcherService.saveSingleUniversitySubject(universitySubject).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects: [universitySubject] }))
         )),
         tap(() => {
            this.snackBarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_SUBJECT_SUCCESS");
         }),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly universitiesFetcherService: UniversitiesFetcherService,
      private readonly snackBarService: SnackBarService
   ) { }
}
