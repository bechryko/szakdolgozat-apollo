import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, universitySubjectCRUDLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap, tap } from "rxjs";
import { universitySubjectActions } from "../actions";

@Injectable()
export class UniversitySubjectEffects {
   public readonly loadUniversitySubjects$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.loadUniversitySubjects),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ universityId }) => this.universitiesFetcherService.getSubjectsForUniversity(universityId).pipe(
            catchAndNotifyError(universitySubjectCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_SUBJECTS_LOAD")
         )),
         map(universitySubjects => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            return universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects });
         })
      )
   );

   public readonly saveUniversitySubjects$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveUniversitySubjects),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universitySubjects, universityId }) => this.universitiesFetcherService.saveUniversitySubjects(universitySubjects, universityId).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects })),
            catchAndNotifyError(universitySubjectCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE")
         )),
         tap(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS");
         })
      )
   );

   public readonly saveSingleUniversitySubject$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveSingleUniversitySubject),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universitySubject }) => this.universitiesFetcherService.saveSingleUniversitySubject(universitySubject).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects: [universitySubject] })),
            catchAndNotifyError(universitySubjectCRUDLoadingKey, "ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE")
         )),
         tap(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_SUBJECT_SUCCESS");
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
