import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, completionsLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { CompletionsUtils } from "@apollo/shared/utils";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { cloneDeep } from "lodash";
import { map, switchMap, take, tap } from "rxjs";
import { CompletionsFetcherService, CompletionsService } from "../../services";
import { completionsActions, userActions } from "../actions";

@Injectable()
export class CompletionsEffects {
   public readonly loadCompletions$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.loadCompletions),
         tap(() => this.loadingService.startLoading(completionsLoadingKey, LoadingType.LOAD)),
         switchMap(() => this.completionsFetcherService.getCompletionsForCurrentUser().pipe(
            catchAndNotifyError(completionsLoadingKey, "ERROR.DATABASE.COMPLETIONS_LOAD")
         )),
         map(completions => {
            this.loadingService.finishLoading(completionsLoadingKey);
            return completionsActions.saveCompletionsToStore({ completions });
         })
      )
   );

   public readonly saveCompletions$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.saveCompletions),
         tap(() => this.loadingService.startLoading(completionsLoadingKey, LoadingType.SAVE)),
         switchMap(({ completions }) => this.completionsFetcherService.saveCompletions(completions).pipe(
            map(() => {
               this.loadingService.finishLoading(completionsLoadingKey);
               return completionsActions.saveCompletionsToStore({ completions });
            }),
            catchAndNotifyError(completionsLoadingKey, "ERROR.DATABASE.COMPLETIONS_SAVE")
         ))
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
      private readonly loadingService: LoadingService
   ) { }
}
