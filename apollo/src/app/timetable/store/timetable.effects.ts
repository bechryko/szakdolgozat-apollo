import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, timetableLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { SnackBarService, UserService } from "@apollo/shared/services";
import { userActions } from "@apollo/shared/store";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap, take, tap } from "rxjs";
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
         switchMap(semesters => this.userService.user$.pipe(
            take(1),
            map(user => {
               this.loadingService.finishLoading(timetableLoadingKey);
               
               const selectedSemesterId = user?.settings?.selectedSemesterId;
               return timetableActions.saveTimetableToStore({
                  newState: { semesters, selectedSemesterId }
               });
            })
         ))
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

   public readonly saveTimetableToStore$ = createEffect(() =>
      this.actions$.pipe(
         ofType(timetableActions.saveTimetableToStore),
         map(({ newState }) => userActions.updateUserSetting({ key: "selectedSemesterId", value: newState.selectedSemesterId }))
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
      private readonly snackbarService: SnackBarService,
      private readonly userService: UserService
   ) { }
}
