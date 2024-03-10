import { Injectable } from '@angular/core';
import { multicast } from '@apollo/shared/operators';
import { Store } from '@ngrx/store';
import { shuffle } from 'lodash';
import { Observable, distinctUntilChanged, map, tap } from 'rxjs';
import { MenuCard } from '../models';
import { menuActions, menuFeature } from '../store';

@Injectable({
   providedIn: 'root'
})
export class MenuCardsService {
   private readonly cards$: Observable<MenuCard[]>;
   public readonly fixedCards$: Observable<MenuCard[]>;
   public readonly shuffledCards$: Observable<MenuCard[]>;

   constructor(
      private readonly store: Store
   ) {
      this.cards$ = this.store.select(menuFeature.selectCards).pipe(
         tap(menuCards => {
            if (!menuCards.length) {
               store.dispatch(menuActions.loadCards());
            }
         }),
         multicast(),
         distinctUntilChanged()
      );

      this.fixedCards$ = this.cards$.pipe(
         map(cards => cards.filter(card => card.fixed)),
         multicast(),
         distinctUntilChanged()
      );

      this.shuffledCards$ = this.cards$.pipe(
         map(cards => shuffle(cards.filter(card => !card.fixed))),
         multicast(),
         distinctUntilChanged()
      );
   }
}
