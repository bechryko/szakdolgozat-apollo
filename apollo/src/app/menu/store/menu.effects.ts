import { Injectable } from "@angular/core";
import { LoadingService, LoadingType, menuLoadingKey } from "@apollo/shared/loading";
import { SnackBarService } from "@apollo/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { MenuCardFetcherService } from "../services";
import { menuActions } from "./menu.actions";

@Injectable()
export class MenuEffects {
   public readonly loadCards$ = createEffect(() =>
      this.actions$.pipe(
         ofType(menuActions.loadCards),
         tap(() => this.loadingService.startLoading(menuLoadingKey, LoadingType.LOAD)),
         switchMap(() => this.menuCardFetcherService.loadMenuCards()),
         map(cards => {
            this.loadingService.finishLoading(menuLoadingKey);
            return menuActions.loadCardsSuccess({ cards });
         }),
         catchError(() => {
            this.loadingService.finishLoading(menuLoadingKey);
            this.snackbarService.openError("ERROR.DATABASE.MENU_CARDS_LOAD");
            return [];
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly menuCardFetcherService: MenuCardFetcherService,
      private readonly loadingService: LoadingService,
      private readonly snackbarService: SnackBarService
   ) { }
}
