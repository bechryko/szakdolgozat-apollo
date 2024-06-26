import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, universityMajorCRUDLoadingKey } from "@apollo/shared/loading";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, filter, map, switchMap, tap } from "rxjs";
import { universityMajorActions } from "../actions";

@Injectable()
export class UniversityMajorEffects {
   public readonly loadUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadUniversityMajors),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ universityId }) => this.universitiesFetcherService.getMajorsForUniversity(universityId)),
         map(universityMajors => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            return universityMajorActions.saveUniversityMajorsToStore({ universityMajors });
         }),
         catchError(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD");
            return [];
         })
      )
   );

   public readonly saveUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveUniversityMajors),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universityMajors, universityId }) => this.universitiesFetcherService.saveUniversityMajors(universityMajors, universityId).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors }))
         )),
         tap(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS", { duration: 4000 });
         }),
         catchError(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE");
            return [];
         })
      )
   );

   public readonly loadSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadSingleUniversityMajor),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ majorId }) => this.universitiesFetcherService.getMajor(majorId)),
         tap(() => this.loadingService.finishLoading(universityMajorCRUDLoadingKey)),
         filter(Boolean),
         map(universityMajor => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] })),
         catchError(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD");
            return [];
         })
      )
   );

   public readonly saveSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveSingleUniversityMajor),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universityMajor }) => this.universitiesFetcherService.saveSingleUniversityMajor(universityMajor).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] }))
         )),
         tap(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_MAJOR_SUCCESS");
         }),
         catchError(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE");
            return [];
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly universitiesFetcherService: UniversitiesFetcherService,
      private readonly snackbarService: SnackBarService,
      private readonly loadingService: LoadingService
   ) { }
}
