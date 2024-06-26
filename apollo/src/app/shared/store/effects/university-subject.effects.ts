import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, universitySubjectCRUDLoadingKey } from "@apollo/shared/loading";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs";
import { universitySubjectActions } from "../actions";

@Injectable()
export class UniversitySubjectEffects {
   public readonly loadUniversitySubjects$ = createEffect(() => 
      this.actions$.pipe(
         ofType(universitySubjectActions.loadUniversitySubjects),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.LOAD)),
         switchMap(({ universityId }) => this.universitiesFetcherService.getSubjectsForUniversity(universityId)),
         map(universitySubjects => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            return universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects });
         }),
         catchError(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_SUBJECTS_LOAD");
            return [];
         })
      )
   );

   public readonly saveUniversitySubjects$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveUniversitySubjects),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universitySubjects, universityId }) => this.universitiesFetcherService.saveUniversitySubjects(universitySubjects, universityId).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects }))
         )),
         tap(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS");
         }),
         catchError(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE");
            return [];
         })
      )
   );

   public readonly saveSingleUniversitySubject$ = createEffect(() =>
      this.actions$.pipe(
         ofType(universitySubjectActions.saveSingleUniversitySubject),
         tap(() => this.loadingService.startLoading(universitySubjectCRUDLoadingKey, LoadingType.SAVE)),
         switchMap(({ universitySubject }) => this.universitiesFetcherService.saveSingleUniversitySubject(universitySubject).pipe(
            map(() => universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects: [universitySubject] }))
         )),
         tap(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.open("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_SUBJECT_SUCCESS");
         }),
         catchError(() => {
            this.loadingService.finishLoading(universitySubjectCRUDLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE");
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
