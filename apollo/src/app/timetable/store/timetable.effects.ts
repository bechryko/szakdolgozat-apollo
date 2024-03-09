import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap } from "rxjs";
import { TimetableFetcherService } from './../services/timetable-fetcher.service';
import { timetableActions } from "./timetable.actions";

@Injectable()
export class TimetableEffects {
   loadTimetable$ = createEffect(() => 
      this.actions$.pipe(
         ofType(timetableActions.loadTimetable),
         switchMap(_ => this.timetableFetcherService.getSemestersForCurrentUser()),
         map(semesters => timetableActions.saveTimetableToStore({ newState: {
            semesters,
            selectedSemesterId: semesters.length >= 1 ? semesters[0].id : undefined
         } }))
      )
   );

   updateTimetable$ = createEffect(() =>
      this.actions$.pipe(
         ofType(timetableActions.updateTimetable),
         switchMap(({ newState }) => this.timetableFetcherService.saveSemesters(newState.semesters).pipe(
            map(_ => newState)
         )),
         map(newState => timetableActions.saveTimetableToStore({ newState })),
         catchError(errorKey => {
            // TODO: error handling
            return [];
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly timetableFetcherService: TimetableFetcherService
   ) { }
}
