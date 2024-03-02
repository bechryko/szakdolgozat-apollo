import { Injectable } from "@angular/core";
import { MenuCardFetcherService } from "@apollo-menu/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs/operators";
import { menuActions } from "./menu.actions";

@Injectable()
export class MenuEffects {
   cardLoad$ = createEffect(() =>
      this.actions$.pipe(
         ofType(menuActions.loadCards),
         switchMap(() => this.menuCardFetcherService.loadMenuCards()),
         map(cards => menuActions.loadCardsSuccess({ cards }))
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly menuCardFetcherService: MenuCardFetcherService
   ) { }
}
