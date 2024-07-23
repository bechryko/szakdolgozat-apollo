import { TestBed } from "@angular/core/testing";
import { University, UniversityFaculty } from "@apollo/shared/models";
import { registerCatchAndNotifyErrorOperator } from "@apollo/shared/operators/catch-and-notify-error";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { of } from "rxjs";
import { universityActions } from "../actions";
import { UniversityEffects } from "./university.effects";

describe('UniversityEffects', () => {
   let actions$: TestColdObservable;
   let effects: UniversityEffects;
   let universitiesFetcherService: jasmine.SpyObj<UniversitiesFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const universities = [
      {
         id: '1',
         name: { en: 'University 1' },
         location: { en: 'Location 1' },
         faculties: [
            {
               id: '1',
               en: 'Faculty 1'
            },
            {
               id: '2',
               en: 'Faculty 2'
            }
         ]
      },
      {
         id: '2',
         name: { en: 'University 2' },
         location: { en: 'Location 2' },
         faculties: [] as UniversityFaculty[]
      },
      {
         id: '3',
         name: { en: 'University 3' },
         location: { en: 'Location 3' },
         faculties: [] as UniversityFaculty[]
      }
   ] as University[];

   function universitiesFetcherServiceFactory() {
      const service = jasmine.createSpyObj(
         'UniversitiesFetcherService',
         ['getUniversities', 'saveUniversities']
      ) as jasmine.SpyObj<UniversitiesFetcherService>;
      service.getUniversities.and.returnValue(of(universities));
      service.saveUniversities.and.returnValue(of(undefined));
      return service;
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            UniversityEffects,
            provideMockActions(() => actions$),
            {
               provide: UniversitiesFetcherService,
               useFactory: universitiesFetcherServiceFactory
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['open', 'openError'])
            }
         ]
      });

      effects = TestBed.inject(UniversityEffects);
      universitiesFetcherService = TestBed.inject(UniversitiesFetcherService) as jasmine.SpyObj<UniversitiesFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;

      registerCatchAndNotifyErrorOperator(jasmine.createSpyObj('LoadingService', ['finishLoading']), snackbarService);
   });

   describe('loadUniversities$', () => {
      it(`should dispatch ${ universityActions.saveUniversitiesToStore.type } action with the loaded universities`, () => {
         actions$ = cold('a', { a: universityActions.loadUniversities() });

         expect(effects.loadUniversities$).toBeObservable(
            cold('a', { a: universityActions.saveUniversitiesToStore({ universities }) })
         );
      });

      it("should open an error snackbar if the universities couldn't be loaded", () => {
         universitiesFetcherService.getUniversities.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityActions.loadUniversities() });

         expect(effects.loadUniversities$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITIES_LOAD");
      });
   });

   describe('saveUniversities$', () => {
      it(`should dispatch ${ universityActions.saveUniversitiesToStore.type } action with the saved universities`, () => {
         actions$ = cold('a', { a: universityActions.saveUniversities({ universities }) });

         expect(effects.saveUniversities$).toBeObservable(
            cold('a', { a: universityActions.saveUniversitiesToStore({ universities }) })
         );
      });

      it("should save the universities", () => {
         actions$ = cold('a', { a: universityActions.saveUniversities({ universities }) });

         effects.saveUniversities$.subscribe();
         getTestScheduler().flush();

         expect(universitiesFetcherService.saveUniversities).toHaveBeenCalledWith(universities);
      });

      it("should open an error snackbar if the universities couldn't be saved", () => {
         universitiesFetcherService.saveUniversities.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityActions.saveUniversities({ universities }) });

         expect(effects.saveUniversities$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITIES_SAVE");
      });
   });
});
