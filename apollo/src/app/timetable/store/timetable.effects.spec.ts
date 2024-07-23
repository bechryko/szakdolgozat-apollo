import { TestBed } from '@angular/core/testing';
import { registerCatchAndNotifyErrorOperator } from '@apollo/shared/operators/catch-and-notify-error';
import { SnackBarService } from '@apollo/shared/services';
import { Semester } from "@apollo/timetable/models";
import { TimetableFetcherService } from "@apollo/timetable/services";
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';
import { of } from "rxjs";
import { timetableActions } from './timetable.actions';
import { TimetableEffects } from "./timetable.effects";
import { TimetableState } from './timetable.state';

describe('TimetableEffects', () => {
   let actions$: TestColdObservable;
   let effects: TimetableEffects;
   let timetableFetcherService: jasmine.SpyObj<TimetableFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   const semesterForCurrentUser = [
      {
         id: '1',
         name: 'Semester 1',
         owner: 'user1',
         activities: [] ,
         categories: [],
      },
      {
         id: '2',
         name: 'Semester 2',
         owner: 'user1',
         activities: [],
         categories: []
      }
   ] as Semester[];

   function timetableFetcherServiceFactory() {
      const service = jasmine.createSpyObj('TimetableFetcherService', ['getSemestersForCurrentUser', 'saveSemesters']) as jasmine.SpyObj<TimetableFetcherService>;
      service.getSemestersForCurrentUser.and.returnValue(of(semesterForCurrentUser));
      service.saveSemesters.and.returnValue(of(undefined));
      return service;
   }
   
   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            TimetableEffects,
            provideMockActions(() => actions$),
            {
               provide: TimetableFetcherService,
               useFactory: timetableFetcherServiceFactory
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['open', 'openError']),
            }
         ],
      });

      effects = TestBed.inject(TimetableEffects);
      timetableFetcherService = TestBed.inject(TimetableFetcherService) as jasmine.SpyObj<TimetableFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;

      registerCatchAndNotifyErrorOperator(jasmine.createSpyObj('LoadingService', ['finishLoading']), snackbarService);
   });
   
   describe('loadTimetable$', () => {
      it(`should dispatch ${ timetableActions.saveTimetableToStore.type }, with the semesters and the selected semester id`, () => {
         actions$ = cold('a', { a: timetableActions.loadTimetable() });

         const expected = cold('b', { b: timetableActions.saveTimetableToStore({ newState: {
            semesters: semesterForCurrentUser,
            selectedSemesterId: semesterForCurrentUser[0].id
         } }) });

         expect(effects.loadTimetable$).toBeObservable(expected);
         expect(timetableFetcherService.getSemestersForCurrentUser).toHaveBeenCalled();
      });

      it("should open an error snackbar if the timetable fetch fails", () => {
         timetableFetcherService.getSemestersForCurrentUser.and.returnValue(cold('#'));
         actions$ = cold('a', { a: timetableActions.loadTimetable() });

         expect(effects.loadTimetable$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledWith('ERROR.DATABASE.TIMETABLE_LOAD');
      });
   });

   describe('updateTimetable$', () => {
      it(`should dispatch ${ timetableActions.saveTimetableToStore.type }, with the new state`, () => {
         const newState = {
            semesters: semesterForCurrentUser,
            selectedSemesterId: '1'
         };
         actions$ = cold('a', { a: timetableActions.updateTimetable({ newState }) });

         const expected = cold('b', { b: timetableActions.saveTimetableToStore({ newState }) });

         expect(effects.updateTimetable$).toBeObservable(expected);
         expect(timetableFetcherService.saveSemesters).toHaveBeenCalledWith(newState.semesters);
      });

      it("should open a success snackbar if the timetable update succeeds", () => {
         const newState = {
            semesters: semesterForCurrentUser,
            selectedSemesterId: '1'
         } as TimetableState;
         actions$ = cold('a', { a: timetableActions.updateTimetable({ newState }) });

         effects.updateTimetable$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledWith("TIMETABLE.SAVE_SUCCESS");
      });

      it("should open an error snackbar if the timetable update fails", () => {
         timetableFetcherService.saveSemesters.and.returnValue(cold('#'));
         const newState = {
            semesters: semesterForCurrentUser,
            selectedSemesterId: '1'
         } as TimetableState;
         actions$ = cold('a', { a: timetableActions.updateTimetable({ newState }) });

         expect(effects.updateTimetable$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledWith('ERROR.DATABASE.TIMETABLE_SAVE');
      });
   });
});
