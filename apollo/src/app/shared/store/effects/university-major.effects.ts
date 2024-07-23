import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, universityMajorCRUDLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { filter, map, switchMap, tap } from "rxjs";
import { universityMajorActions } from "../actions";

@Injectable()
export class UniversityMajorEffects {
   public readonly loadUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadUniversityMajors),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ universityId }) => this.universitiesFetcherService.getMajorsForUniversity(universityId).pipe(
            catchAndNotifyError(universityMajorCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD")
         )),
         map(universityMajors => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            return universityMajorActions.saveUniversityMajorsToStore({ universityMajors });
         })
      )
   );

   public readonly saveUniversityMajors$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveUniversityMajors),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universityMajors, universityId }) => this.universitiesFetcherService.saveUniversityMajors(universityMajors, universityId).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors })),
            catchAndNotifyError(universityMajorCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE")
         )),
         tap(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS", { duration: 4000 });
         })
      )
   );

   public readonly loadSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.loadSingleUniversityMajor),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ majorId }) => this.universitiesFetcherService.getMajor(majorId).pipe(
            catchAndNotifyError(universityMajorCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD")
         )),
         tap(() => this.loadingService.finishLoading(universityMajorCRUDLoadingKey)),
         filter(Boolean),
         map(universityMajor => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] }))
      )
   );

   public readonly saveSingleUniversityMajor$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universityMajorActions.saveSingleUniversityMajor),
         tap(() => this.loadingService.startLoading(universityMajorCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universityMajor }) => this.universitiesFetcherService.saveSingleUniversityMajor(universityMajor).pipe(
            map(() => universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [universityMajor] })),
            catchAndNotifyError(universityMajorCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE")
         )),
         tap(() => {
            this.loadingService.finishLoading(universityMajorCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_MAJOR_SUCCESS");
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
