import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, completionsLoadingKey } from "@apollo/shared/loading";
import { CompletionsUtils } from "@apollo/shared/utils";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { cloneDeep } from "lodash";
import { catchError, map, switchMap, take, tap } from "rxjs";
import { CompletionsFetcherService, CompletionsService, SnackBarService } from "../../services";
import { userActions } from "../actions";
import { completionsActions } from "../actions/completions.actions";

@Injectable()
export class CompletionsEffects {
   public readonly loadCompletions$ = createEffect(() => 
      this.actions$.pipe(
         ofType(completionsActions.loadCompletions),
         tap(() => this.loadingService.startLoading(completionsLoadingKey, LoadingType.LOAD)),
         switchMap(() => this.completionsFetcherService.getCompletionsForCurrentUser()),
         map(completions => {
            this.loadingService.finishLoading(completionsLoadingKey);
            return completionsActions.saveCompletionsToStore({ completions });
         }),
         catchError(() => {
            this.loadingService.finishLoading(completionsLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.COMPLETIONS_LOAD");
            return [];
         })
      )
   );

   public readonly saveCompletions$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.saveCompletions),
         tap(() => this.loadingService.startLoading(completionsLoadingKey, LoadingType.SAVE)),
         switchMap(({ completions }) => this.completionsFetcherService.saveCompletions(completions)),
         map(() => {
            this.loadingService.finishLoading(completionsLoadingKey);
            return completionsActions.loadCompletions();
         }),
         catchError(() => {
            this.loadingService.finishLoading(completionsLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.COMPLETIONS_SAVE");
            return [];
         })
      )
   );

   public readonly completeSubject$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.completeSubject),
         tap(() => this.loadingService.startLoading(completionsLoadingKey, LoadingType.SAVE)),
         switchMap(({ subject }) => this.completionsService.universityCompletions$.pipe(
            take(1),
            map(completions => {
               const updatedCompletions = cloneDeep(completions);

               const unassignedCompletionsCollector = updatedCompletions.find(completion => completion.isUnassignedCompletionsCollector);
               CompletionsUtils.addToUnassignedCompletionsCollector(unassignedCompletionsCollector, subject, updatedCompletions);

               return updatedCompletions;
            })
         )),
         map(completions => {
            this.loadingService.finishLoading(completionsLoadingKey);
            return completionsActions.saveCompletions({ completions });
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
      private readonly completionsFetcherService: CompletionsFetcherService,
      private readonly completionsService: CompletionsService,
      private readonly loadingService: LoadingService,
      private readonly snackbarService: SnackBarService
   ) { }
}
