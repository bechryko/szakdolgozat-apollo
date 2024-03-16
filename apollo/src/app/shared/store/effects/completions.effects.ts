import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap } from "rxjs";
import { CompletionsFetcherService } from "../../services";
import { completionsActions } from "../actions/completions.actions";

@Injectable()
export class CompletionsEffects {
   loadCompletions$ = createEffect(() => 
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

   saveCompletions$ = createEffect(() =>
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

   constructor(
      private readonly actions$: Actions,
      private readonly completionsFetcherService: CompletionsFetcherService
   ) { }
}
