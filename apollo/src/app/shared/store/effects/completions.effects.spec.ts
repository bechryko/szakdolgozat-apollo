import { TestBed } from "@angular/core/testing";
import { UniversityCompletionYear, UniversitySubject } from "@apollo/shared/models";
import { CompletionsFetcherService, CompletionsService, SnackBarService } from "@apollo/shared/services";
import { CompletionsUtils } from "@apollo/shared/utils";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { BehaviorSubject, of } from "rxjs";
import { completionsActions, userActions } from "../actions";
import { CompletionsEffects } from "./completions.effects";

describe('CompletionsEffects', () => {
   let actions$: TestColdObservable;
   let effects: CompletionsEffects;
   let completionsFetcherService: jasmine.SpyObj<CompletionsFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const userCompletions = [
      {
         firstSemester: [
            { code: '1', credit: 3 },
            { code: '2', credit: 3 }
         ],
         secondSemester: [
            { code: '4', credit: 3 },
            { code: '5', credit: 3 }
         ],
      }
   ] as UniversityCompletionYear[];

   function completionsFetcherServiceFactory() {
      const service = jasmine.createSpyObj(
         'CompletionsFetcherService',
         ['saveCompletions', 'clearGuestStorage', 'getCompletionsForCurrentUser']
      ) as jasmine.SpyObj<CompletionsFetcherService>;
      service.saveCompletions.and.returnValue(of(undefined));
      service.getCompletionsForCurrentUser.and.returnValue(of(userCompletions));
      return service;
   }

   let universityCompletions$: BehaviorSubject<UniversityCompletionYear[]>;
   function completionsServiceFactory() {
      return {
         ...jasmine.createSpyObj('CompletionsService', ['']),
         universityCompletions$
      } as jasmine.SpyObj<CompletionsService>;
   }

   beforeEach(() => {
      universityCompletions$ = new BehaviorSubject<UniversityCompletionYear[]>(userCompletions);

      TestBed.configureTestingModule({
         providers: [
            CompletionsEffects,
            provideMockActions(() => actions$),
            {
               provide: CompletionsFetcherService,
               useFactory: completionsFetcherServiceFactory
            },
            {
               provide: CompletionsService,
               useFactory: completionsServiceFactory
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['openError'])
            }
         ]
      });

      effects = TestBed.inject(CompletionsEffects);
      completionsFetcherService = TestBed.inject(CompletionsFetcherService) as jasmine.SpyObj<CompletionsFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
   });

   describe('loadCompletions$', () => {
      it(`should dispatch ${ completionsActions.saveCompletionsToStore.type } action with the loaded completions`, () => {
         actions$ = cold('a', { a: completionsActions.loadCompletions() });

         expect(effects.loadCompletions$).toBeObservable(
            cold('a', { a: completionsActions.saveCompletionsToStore({ completions: userCompletions }) })
         );
      });

      it("should open an error snackbar if the loading fails", () => {
         completionsFetcherService.getCompletionsForCurrentUser.and.returnValue(cold('#'));

         actions$ = cold('a', { a: completionsActions.loadCompletions() });

         expect(effects.loadCompletions$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.COMPLETIONS_LOAD");
      });
   });

   describe('saveCompletions$', () => {
      it(`should dispatch ${ completionsActions.loadCompletions.type } action`, () => {
         actions$ = cold('a', { a: completionsActions.saveCompletions({ completions: userCompletions }) });

         expect(effects.saveCompletions$).toBeObservable(
            cold('a', { a: completionsActions.loadCompletions() })
         );
      });

      it("should save completions to database", () => {
         actions$ = cold('a', { a: completionsActions.saveCompletions({ completions: userCompletions }) });

         effects.saveCompletions$.subscribe();
         getTestScheduler().flush();

         expect(completionsFetcherService.saveCompletions).toHaveBeenCalledWith(userCompletions);
      });

      it("should open an error snackbar if the saving fails", () => {
         completionsFetcherService.saveCompletions.and.returnValue(cold('#'));

         actions$ = cold('a', { a: completionsActions.saveCompletions({ completions: userCompletions }) });

         expect(effects.saveCompletions$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.COMPLETIONS_SAVE");
      });
   });

   describe('completeSubject$', () => {
      let addToUnassignedCompletionsCollectorSpy: jasmine.Spy;

      beforeEach(() => {
         addToUnassignedCompletionsCollectorSpy = spyOn(CompletionsUtils, 'addToUnassignedCompletionsCollector');
      });

      it(`should dispatch ${ completionsActions.saveCompletions.type } action`, () => {
         const subject = { code: '1', credit: 3 } as UniversitySubject;
         actions$ = cold('a', { a: completionsActions.completeSubject({ subject }) });

         expect(effects.completeSubject$).toBeObservable(
            cold('a', { a: completionsActions.saveCompletions({ completions: userCompletions }) })
         );
      });

      it("should add subject to the unassigned collector year", () => {
         const subject = { code: '1', credit: 3 } as UniversitySubject;
         actions$ = cold('a', { a: completionsActions.completeSubject({ subject }) });
         const unassignedCompletionsCollector = { isUnassignedCompletionsCollector: true } as UniversityCompletionYear;
         const modifiedUserCompletions = [
            ...userCompletions,
            unassignedCompletionsCollector
         ];
         universityCompletions$.next(modifiedUserCompletions);

         effects.completeSubject$.subscribe();
         getTestScheduler().flush();

         expect(addToUnassignedCompletionsCollectorSpy).toHaveBeenCalledWith(unassignedCompletionsCollector, subject, modifiedUserCompletions);
      });
   });

   describe('clearUserData$', () => {
      it(`should dispatch ${ completionsActions.deleteData.type } action`, () => {
         actions$ = cold('a', { a: userActions.clearUserData() });

         expect(effects.clearUserData$).toBeObservable(
            cold('a', { a: completionsActions.deleteData() })
         );
      });
   });

   describe('deleteGuestData$', () => {
      it(`should dispatch ${ completionsActions.deleteData.type } action`, () => {
         actions$ = cold('a', { a: completionsActions.deleteGuestData() });

         expect(effects.deleteGuestData$).toBeObservable(
            cold('a', { a: completionsActions.deleteData() })
         );
      });

      it("should clear guest storage", () => {
         actions$ = cold('a', { a: completionsActions.deleteGuestData() });

         effects.deleteGuestData$.subscribe();
         getTestScheduler().flush();

         expect(completionsFetcherService.clearGuestStorage).toHaveBeenCalled();
      });
   });
});
