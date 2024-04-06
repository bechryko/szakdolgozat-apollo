import { Injectable } from "@angular/core";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, filter, map, switchMap, tap } from "rxjs";
import { universityMajorActions } from "../actions";

@Injectable()
export class UniversityMajorEffects {
   public readonly loadUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadUniversityMajors),
         switchMap(({ universityId }) => this.universitiesFetcherService.getMajorsForUniversity(universityId)),
         map(universityMajors => universityMajorActions.saveUniversityMajorsToStore({ universityMajors })),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly saveUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveUniversityMajors),
         switchMap(({ universityMajors, universityId }) => this.universitiesFetcherService.saveUniversityMajors(universityMajors, universityId).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors }))
         )),
         tap(() => {
            this.snackBarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS", { duration: 4000 });
         }),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly saveSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveSingleUniversityMajor),
         switchMap(({ universityMajor }) => this.universitiesFetcherService.saveSingleUniversityMajor(universityMajor).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] }))
         )),
         tap(() => {
            this.snackBarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_MAJOR_SUCCESS");
         }),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly loadSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadSingleUniversityMajor),
         switchMap(({ majorId }) => this.universitiesFetcherService.getMajor(majorId)),
         filter(Boolean),
         map(universityMajor => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] })),
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
