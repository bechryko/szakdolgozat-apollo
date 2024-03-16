import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs";
import { CompletionsFetcherService } from "../../services";
import { userActions } from "../actions";
import { completionsActions } from "../actions/completions.actions";

@Injectable()
export class CompletionsEffects {
   public readonly loadCompletions$ = createEffect(() => 
      this.actions$.pipe(
         ofType(completionsActions.loadCompletions),
         switchMap(() => this.completionsFetcherService.getCompletionsForCurrentUser()),
         map(completions => completionsActions.saveCompletionsToStore({ completions })),
         catchError(() => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly saveCompletions$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.saveCompletions),
         switchMap(({ completions }) => this.completionsFetcherService.saveCompletions(completions)),
         map(() => completionsActions.loadCompletions()),
         catchError(() => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly clearUserData$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.clearUserData),
         map(_ => completionsActions.deleteData())
      )
   );

   public readonly deleteGuestData$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.deleteGuestData),
         tap(_ => this.completionsFetcherService.clearGuestStorage()),
         map(_ => completionsActions.deleteData())
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly completionsFetcherService: CompletionsFetcherService
   ) { }
}
