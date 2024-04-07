import { Injectable } from "@angular/core";
import { UniversityCompletionYear } from "@apollo/shared/models";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { cloneDeep } from "lodash";
import { catchError, map, switchMap, take, tap } from "rxjs";
import { CompletionsFetcherService, CompletionsService } from "../../services";
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

   public readonly completeSubject$ = createEffect(() =>
      this.actions$.pipe(
         ofType(completionsActions.completeSubject),
         switchMap(({ subject }) => this.completionsService.universityCompletions$.pipe(
            take(1),
            map(completions => {
               const updatedCompletions = cloneDeep(completions);

               const unassignedCompletionsCollector = updatedCompletions.find(completion => completion.isUnassignedCompletionsCollector);
               if(unassignedCompletionsCollector) {
                  unassignedCompletionsCollector.firstSemester.push({
                     name: subject.name,
                     code: subject.code,
                     rating: 3,
                     credit: subject.credit
                  });
               } else {
                  const newCompletion: UniversityCompletionYear = {
                     id: "unassignedCompletionsCollector" + Date.now(),
                     name: "unassignedCompletionsCollector",
                     owner: "",
                     firstSemester: [
                        {
                           name: subject.name,
                           code: subject.code,
                           rating: 3,
                           credit: subject.credit
                        }
                     ],
                     secondSemester: [],
                     isUnassignedCompletionsCollector: true
                  };
                  updatedCompletions.push(newCompletion);
               }

               return updatedCompletions;
            })
         )),
         map(completions => completionsActions.saveCompletions({ completions })),
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
      private readonly completionsFetcherService: CompletionsFetcherService,
      private readonly completionsService: CompletionsService
   ) { }
}
