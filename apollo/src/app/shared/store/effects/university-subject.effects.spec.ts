import { TestBed } from "@angular/core/testing";
import { UniversitySubject } from "@apollo/shared/models";
import { registerCatchAndNotifyErrorOperator } from "@apollo/shared/operators/catch-and-notify-error";
import { SnackBarService, UniversitiesFetcherService } from "@apollo/shared/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { of } from "rxjs";
import { universitySubjectActions } from "../actions";
import { UniversitySubjectEffects } from "./university-subject.effects";

describe('UniversitySubjectEffects', () => {
   let actions$: TestColdObservable;
   let effects: UniversitySubjectEffects;
   let universitiesFetcherService: jasmine.SpyObj<UniversitiesFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const universitySubjects = [
      {
         id: '1',
         name: 'Subject 1'
      },
      {
         id: '2',
         name: 'Subject 2'
      },
      {
         id: '3',
         name: 'Subject 3'
      }
   ] as UniversitySubject[];

   const universityId = '1';

   function universitiesFetcherServiceFactory() {
      const service = jasmine.createSpyObj(
         'UniversitiesFetcherService',
         ['getSubjectsForUniversity', 'saveUniversitySubjects', 'saveSingleUniversitySubject']
      ) as jasmine.SpyObj<UniversitiesFetcherService>;
      service.getSubjectsForUniversity.and.returnValue(of(universitySubjects));
      service.saveUniversitySubjects.and.returnValue(of(undefined));
      service.saveSingleUniversitySubject.and.returnValue(of(undefined));
      return service;
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            UniversitySubjectEffects,
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

      effects = TestBed.inject(UniversitySubjectEffects);
      universitiesFetcherService = TestBed.inject(UniversitiesFetcherService) as jasmine.SpyObj<UniversitiesFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;

      registerCatchAndNotifyErrorOperator(jasmine.createSpyObj('LoadingService', ['finishLoading']), snackbarService);
   });

   describe('loadUniversitySubjects$', () => {
      it(`should dispatch ${ universitySubjectActions.saveUniversitySubjectsToStore.type } action with the loaded university subjects`, () => {
         actions$ = cold('a', { a: universitySubjectActions.loadUniversitySubjects({ universityId }) });

         expect(effects.loadUniversitySubjects$).toBeObservable(
            cold('a', { a: universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects }) })
         );
      });

      it("should open an error snackbar if the university subjects can't be loaded", () => {
         universitiesFetcherService.getSubjectsForUniversity.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universitySubjectActions.loadUniversitySubjects({ universityId }) });

         expect(effects.loadUniversitySubjects$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_SUBJECTS_LOAD");
      });
   });

   describe('saveUniversitySubjects$', () => {
      it(`should dispatch ${ universitySubjectActions.saveUniversitySubjectsToStore.type } action with the saved university subjects`, () => {
         actions$ = cold('a', { a: universitySubjectActions.saveUniversitySubjects({ universitySubjects, universityId }) });

         expect(effects.saveUniversitySubjects$).toBeObservable(
            cold('a', { a: universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects }) })
         );
      });

      it("should save the university subjects", () => {
         actions$ = cold('a', { a: universitySubjectActions.saveUniversitySubjects({ universitySubjects, universityId }) });

         effects.saveUniversitySubjects$.subscribe();
         getTestScheduler().flush();

         expect(universitiesFetcherService.saveUniversitySubjects).toHaveBeenCalledWith(universitySubjects, universityId);
      });

      it("should open a success snackbar if the university subjects are saved", () => {
         actions$ = cold('a', { a: universitySubjectActions.saveUniversitySubjects({ universitySubjects, universityId }) });

         effects.saveUniversitySubjects$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledOnceWith("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_ALL_SUCCESS");
      });

      it("should open an error snackbar if the university subjects can't be saved", () => {
         universitiesFetcherService.saveUniversitySubjects.and.returnValue(cold('#'));
         actions$ = cold('a', { a: universitySubjectActions.saveUniversitySubjects({ universitySubjects, universityId }) });

         expect(effects.saveUniversitySubjects$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE");
      });
   });

   describe('saveSingleUniversitySubject$', () => {
      it(`should dispatch ${ universitySubjectActions.saveUniversitySubjectsToStore.type } action with the saved university subject`, () => {
         const universitySubject = universitySubjects[0];
         actions$ = cold('a', { a: universitySubjectActions.saveSingleUniversitySubject({ universitySubject }) });

         expect(effects.saveSingleUniversitySubject$).toBeObservable(
            cold('a', { a: universitySubjectActions.saveUniversitySubjectsToStore({ universitySubjects: [universitySubject] }) })
         );
      });

      it("should save the university subject", () => {
         const universitySubject = universitySubjects[0];
         actions$ = cold('a', { a: universitySubjectActions.saveSingleUniversitySubject({ universitySubject }) });

         effects.saveSingleUniversitySubject$.subscribe();
         getTestScheduler().flush();

         expect(universitiesFetcherService.saveSingleUniversitySubject).toHaveBeenCalledWith(universitySubject);
      });

      it("should open a success snackbar if the university subject is saved", () => {
         const universitySubject = universitySubjects[0];
         actions$ = cold('a', { a: universitySubjectActions.saveSingleUniversitySubject({ universitySubject }) });

         effects.saveSingleUniversitySubject$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledOnceWith("ADMINISTRATION.UNIVERSITY_DETAILS.SAVE_SINGLE_SUBJECT_SUCCESS");
      });

      it("should open an error snackbar if the university subject can't be saved", () => {
         universitiesFetcherService.saveSingleUniversitySubject.and.returnValue(cold('#'));
         const universitySubject = universitySubjects[0];
         actions$ = cold('a', { a: universitySubjectActions.saveSingleUniversitySubject({ universitySubject }) });

         expect(effects.saveSingleUniversitySubject$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.UNIVERSITY_SUBJECTS_SAVE");
      });
   });
});
