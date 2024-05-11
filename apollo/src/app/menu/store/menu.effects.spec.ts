import { TestBed } from "@angular/core/testing";
import { SnackBarService } from "@apollo/shared/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { of } from "rxjs";
import { MenuCard } from "../models";
import { MenuCardFetcherService } from "../services";
import { menuActions } from "./menu.actions";
import { MenuEffects } from "./menu.effects";

describe('MenuEffects', () => {
   let actions$: TestColdObservable;
   let effects: MenuEffects;
   let menuCardFetcherService: jasmine.SpyObj<MenuCardFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const cards = [
      {
         title: 'Card 1',
         description: 'Description 1'
      },
      {
         title: 'Card 2',
         description: 'Description 2',
         fixed: true
      }
   ] as MenuCard[];

   function menuCardFetcherServiceFactory() {
      const service = jasmine.createSpyObj('MenuCardFetcherService', ['loadMenuCards']) as jasmine.SpyObj<MenuCardFetcherService>;
      service.loadMenuCards.and.returnValue(of(cards));
      return service;
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            MenuEffects,
            provideMockActions(() => actions$),
            {
               provide: MenuCardFetcherService,
               useFactory: menuCardFetcherServiceFactory
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['openError'])
            }
         ]
      });

      effects = TestBed.inject(MenuEffects);
      menuCardFetcherService = TestBed.inject(MenuCardFetcherService) as jasmine.SpyObj<MenuCardFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
   });

   describe('loadCards$', () => {
      it(`should dispatch ${ menuActions.loadCardsSuccess.type } action with the loaded cards`, () => {
         actions$ = cold('a', { a: menuActions.loadCards() });

         expect(effects.loadCards$).toBeObservable(
            cold('a', { a: menuActions.loadCardsSuccess({ cards }) })
         );
      });

      it("should open an error snackbar if the cards can't be loaded", () => {
         menuCardFetcherService.loadMenuCards.and.returnValue(cold('#'));

         actions$ = cold('a', { a: menuActions.loadCards() });

         expect(effects.loadCards$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.MENU_CARDS_LOAD");
      });
   });
});
