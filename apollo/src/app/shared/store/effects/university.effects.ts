import { Injectable } from "@angular/core";
import { UniversitiesFetcherService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap } from "rxjs";
import { universityActions } from "../actions";

@Injectable()
export class UniversityEffects {
   public readonly loadUniversities$ = createEffect(() => this.actions$.pipe(
      ofType(universityActions.loadUniversities),
      switchMap(() => this.universitiesFetcherService.getUniversities()),
      map(universities => universityActions.saveUniversitiesToStore({ universities })),
      catchError(error => {
         // TODO: error handling
         return [];
      })
   ));

   public readonly saveUniversities$ = createEffect(() => this.actions$.pipe(
      ofType(universityActions.saveUniversities),
      switchMap(({ universities }) => this.universitiesFetcherService.saveUniversities(universities).pipe(
         map(() => universityActions.saveUniversitiesToStore({ universities }))
      )),
      catchError(error => {
         // TODO: error handling
         return [];
      })
   ));

   constructor(
      private readonly actions$: Actions,
      private readonly universitiesFetcherService: UniversitiesFetcherService
   ) { }
}
