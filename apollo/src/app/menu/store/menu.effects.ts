import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, switchMap } from "rxjs/operators";
import { MenuCardFetcherService } from "../services";
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
