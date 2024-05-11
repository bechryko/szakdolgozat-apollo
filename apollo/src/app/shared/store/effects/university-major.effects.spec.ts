import { TestBed } from "@angular/core/testing";
import { UniversityMajor } from "@apollo/shared/models";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { of } from "rxjs";
import { universityMajorActions } from "../actions";
import { UniversityMajorEffects } from "./university-major.effects";

describe('UniversityMajorEffects', () => {
   let actions$: TestColdObservable;
   let effects: UniversityMajorEffects;
   let universitiesFetcherService: jasmine.SpyObj<UniversitiesFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const universityMajors = [
      {
         id: '1',
         name: 'Major 1'
      },
      {
         id: '2',
         name: 'Major 2'
      }
   ] as UniversityMajor[];

   const singleMajor = {
      id: '01',
      name: 'Major 01'
   } as UniversityMajor;

   const universityId = '1';

   function universitiesFetcherServiceFactory() {
      const service = jasmine.createSpyObj(
         'UniversitiesFetcherService',
         ['getMajorsForUniversity', 'saveUniversityMajors', 'getMajor', 'saveSingleUniversityMajor']
      ) as jasmine.SpyObj<UniversitiesFetcherService>;
      service.getMajorsForUniversity.and.returnValue(of(universityMajors));
      service.saveUniversityMajors.and.returnValue(of(undefined));
      service.getMajor.and.returnValue(of(singleMajor));
      service.saveSingleUniversityMajor.and.returnValue(of(undefined));
      return service;
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            UniversityMajorEffects,
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

      effects = TestBed.inject(UniversityMajorEffects);
      universitiesFetcherService = TestBed.inject(UniversitiesFetcherService) as jasmine.SpyObj<UniversitiesFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
   });

   describe('loadUniversityMajors$', () => {
      it(`should dispatch ${ universityMajorActions.saveUniversityMajorsToStore.type } action with the loaded university majors`, () => {
         actions$ = cold('a', { a: universityMajorActions.loadUniversityMajors({ universityId }) });

         expect(effects.loadUniversityMajors$).toBeObservable(
            cold('a', { a: universityMajorActions.saveUniversityMajorsToStore({ universityMajors }) })
         );
      });

      it("should open an error snackbar if the university majors can't be loaded", () => {
         universitiesFetcherService.getMajorsForUniversity.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityMajorActions.loadUniversityMajors({ universityId }) });

         expect(effects.loadUniversityMajors$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD");
      });
   });

   describe('saveUniversityMajors$', () => {
      it(`should dispatch ${ universityMajorActions.saveUniversityMajorsToStore.type } action`, () => {
         actions$ = cold('a', { a: universityMajorActions.saveUniversityMajors({ universityMajors, universityId }) });

         expect(effects.saveUniversityMajors$).toBeObservable(
            cold('a', { a: universityMajorActions.saveUniversityMajorsToStore({ universityMajors }) })
         );
      });

      it("should save the university majors", () => {
         actions$ = cold('a', { a: universityMajorActions.saveUniversityMajors({ universityMajors, universityId }) });

         effects.saveUniversityMajors$.subscribe();
         getTestScheduler().flush();

         expect(universitiesFetcherService.saveUniversityMajors).toHaveBeenCalledWith(universityMajors, universityId);
      });

      it("should open a success snackbar after saving the university majors", () => {
         actions$ = cold('a', { a: universityMajorActions.saveUniversityMajors({ universityMajors, universityId }) });

         effects.saveUniversityMajors$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledOnceWith("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS", jasmine.any(Object));
      });

      it("should open an error snackbar if the university majors can't be saved", () => {
         universitiesFetcherService.saveUniversityMajors.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityMajorActions.saveUniversityMajors({ universityMajors, universityId }) });

         expect(effects.saveUniversityMajors$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE");
      });
   });

   describe('loadSingleUniversityMajor$', () => {
      const majorId = '01';

      it(`should dispatch ${ universityMajorActions.saveUniversityMajorsToStore.type } action with the loaded university major`, () => {
         actions$ = cold('a', { a: universityMajorActions.loadSingleUniversityMajor({ majorId }) });

         expect(effects.loadSingleUniversityMajor$).toBeObservable(
            cold('a', { a: universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [singleMajor] }) })
         );
      });

      it("should not emit anything if the university major doesn't exist", () => {
         universitiesFetcherService.getMajor.and.returnValue(of());
         actions$ = cold('a', { a: universityMajorActions.loadSingleUniversityMajor({ majorId: 'nonExistentId' }) });

         expect(effects.loadSingleUniversityMajor$).toBeObservable(cold(''));
      });

      it("should open an error snackbar if the university major can't be loaded", () => {
         universitiesFetcherService.getMajor.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityMajorActions.loadSingleUniversityMajor({ majorId }) });

         expect(effects.loadSingleUniversityMajor$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_MAJORS_LOAD");
      });
   });

   describe('saveSingleUniversityMajor$', () => {
      it(`should dispatch ${ universityMajorActions.saveUniversityMajorsToStore.type } action`, () => {
         actions$ = cold('a', { a: universityMajorActions.saveSingleUniversityMajor({ universityMajor: singleMajor }) });

         expect(effects.saveSingleUniversityMajor$).toBeObservable(
            cold('a', { a: universityMajorActions.saveUniversityMajorsToStore({ universityMajors: [singleMajor] }) })
         );
      });

      it("should save the university major", () => {
         actions$ = cold('a', { a: universityMajorActions.saveSingleUniversityMajor({ universityMajor: singleMajor }) });

         effects.saveSingleUniversityMajor$.subscribe();
         getTestScheduler().flush();

         expect(universitiesFetcherService.saveSingleUniversityMajor).toHaveBeenCalledWith(singleMajor);
      });

      it("should open a success snackbar after saving the university major", () => {
         actions$ = cold('a', { a: universityMajorActions.saveSingleUniversityMajor({ universityMajor: singleMajor }) });

         effects.saveSingleUniversityMajor$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledOnceWith("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_MAJOR_SUCCESS");
      });

      it("should open an error snackbar if the university major can't be saved", () => {
         universitiesFetcherService.saveSingleUniversityMajor.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universityMajorActions.saveSingleUniversityMajor({ universityMajor: singleMajor }) });

         expect(effects.saveSingleUniversityMajor$).toBeObservable(cold('|'));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_MAJORS_SAVE");
      });
   });
});
