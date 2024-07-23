import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, timetableLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { SnackBarService } from "@apollo/shared/services";
import { userActions } from "@apollo/shared/store";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap, tap } from "rxjs";
import { TimetableFetcherService } from './../services';
import { timetableActions } from "./timetable.actions";

@Injectable()
export class TimetableEffects {
   public readonly loadTimetable$ = createEffect(() =>
      this.actions$.pipe(
         ofType(timetableActions.loadTimetable),
         tap(() => this.loadingService.startLoading(timetableLoadingKey, LoadingType.LOAD)),
         switchMap(_ => this.timetableFetcherService.getSemestersForCurrentUser().pipe(
            catchAndNotifyError(timetableLoadingKey, "ERROR.DATABASE.TIMETABLE_LOAD")
         )),
         map(semesters => {
            this.loadingService.finishLoading(timetableLoadingKey);
            return timetableActions.saveTimetableToStore({
               newState: {
                  semesters,
                  selectedSemesterId: semesters.length >= 1 ? semesters[0].id : undefined
               }
            });
         })
      )
   );

   public readonly updateTimetable$ = createEffect(() =>
      this.actions$.pipe(
         ofType(timetableActions.updateTimetable),
         tap(() => this.loadingService.startLoading(timetableLoadingKey, LoadingType.SAVE)),
         switchMap(({ newState }) => this.timetableFetcherService.saveSemesters(newState.semesters!).pipe(
            map(() => {
               this.loadingService.finishLoading(timetableLoadingKey);
               this.snackbarService.open("TIMETABLE.SAVE_SUCCESS");
               return timetableActions.saveTimetableToStore({ newState });
            }),
            catchAndNotifyError(timetableLoadingKey, "ERROR.DATABASE.TIMETABLE_SAVE")
         ))
      )
   );

   public readonly clearUserData$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.clearUserData),
         map(_ => timetableActions.deleteData())
      )
   );

   public readonly deleteGuestData$ = createEffect(() =>
      this.actions$.pipe(
         ofType(timetableActions.deleteGuestData),
         tap(_ => this.timetableFetcherService.clearGuestStorage()),
         map(_ => timetableActions.deleteData())
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly timetableFetcherService: TimetableFetcherService,
      private readonly loadingService: LoadingService,
      private readonly snackbarService: SnackBarService
   ) { }
}
