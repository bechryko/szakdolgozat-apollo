import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap } from "rxjs";
import { CompletionsFetcherService } from "../services";
import { coreActions } from "./core.actions";

@Injectable()
export class CoreEffects {
   loadCompletions$ = createEffect(() => 
      this.actions$.pipe(
         ofType(coreActions.loadCompletions),
         switchMap(() => this.completionsFetcherService.getCompletionsForCurrentUser()),
         map(completions => coreActions.saveCompletionsToStore({ completions })),
         catchError(() => {
            // TODO: error handling
            return [];
         })
      )
   );

   saveCompletions$ = createEffect(() =>
      this.actions$.pipe(
         ofType(coreActions.saveCompletions),
         switchMap(({ completions }) => this.completionsFetcherService.saveCompletions(completions)),
         map(() => coreActions.loadCompletions()),
         catchError(() => {
            // TODO: error handling
            return [];
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly completionsFetcherService: CompletionsFetcherService
   ) {}
}
