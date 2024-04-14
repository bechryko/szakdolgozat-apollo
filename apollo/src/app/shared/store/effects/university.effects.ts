import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, universityCRUDLoadingKey } from "@apollo/shared/loading";
import { UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs";
import { universityActions } from "../actions";

@Injectable()
export class UniversityEffects {
   public readonly loadUniversities$ = createEffect(() => this.actions$.pipe(
      ofType(universityActions.loadUniversities),
      tap(() => this.loadingService.startLoading(universityCRUDLoadingKey, LoadingType.LOAD)),
      switchMap(() => this.universitiesFetcherService.getUniversities()),
      map(universities => {
         this.loadingService.finishLoading(universityCRUDLoadingKey);
         return universityActions.saveUniversitiesToStore({ universities });
      }),
      catchError(error => {
         this.loadingService.finishLoading(universityCRUDLoadingKey);
         // TODO: error handling
         return [];
      })
   ));

   public readonly saveUniversities$ = createEffect(() => this.actions$.pipe(
      ofType(universityActions.saveUniversities),
      tap(() => this.loadingService.startLoading(universityCRUDLoadingKey, LoadingType.SAVE)),
      switchMap(({ universities }) => this.universitiesFetcherService.saveUniversities(universities).pipe(
         map(() => universityActions.saveUniversitiesToStore({ universities }))
      )),
      tap(() => this.loadingService.finishLoading(universityCRUDLoadingKey)),
      catchError(error => {
         this.loadingService.finishLoading(universityCRUDLoadingKey);
         // TODO: error handling
         return [];
      })
   ));

   constructor(
      private readonly actions$: Actions,
      private readonly universitiesFetcherService: UniversitiesFetcherService,
      private readonly loadingService: LoadingService
   ) { }
}
