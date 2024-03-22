import { TestBed } from '@angular/core/testing';
import { Semester } from "@apollo/timetable/models";
import { TimetableFetcherService } from "@apollo/timetable/services/timetable-fetcher.service";
import { provideMockActions } from '@ngrx/effects/testing';
import { cold } from 'jasmine-marbles';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';
import { of } from "rxjs";
import { timetableActions } from './timetable.actions';
import { TimetableEffects } from "./timetable.effects";

describe('TimetableEffects', () => {
   let timetableFetcherService: jasmine.SpyObj<TimetableFetcherService>;
   let actions$: TestColdObservable;
   let effects: TimetableEffects;

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
   
   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            TimetableEffects,
            provideMockActions(() => actions$),
            {
               provide: TimetableFetcherService,
               useValue: jasmine.createSpyObj('TimetableFetcherService', ['getSemestersForCurrentUser', 'saveSemesters']),
            },
         ],
      });

      timetableFetcherService = TestBed.inject(TimetableFetcherService) as jasmine.SpyObj<TimetableFetcherService>;
      effects = TestBed.inject(TimetableEffects);
   });
   
   describe('loadTimetable$', () => {
      it(`should dispatch ${ timetableActions.saveTimetableToStore.type }, with the semesters and the selected semester id`, () => {
         actions$ = cold('a', { a: timetableActions.loadTimetable() });
         timetableFetcherService.getSemestersForCurrentUser.and.returnValue(of(semesterForCurrentUser));

         const expected = cold('b', { b: timetableActions.saveTimetableToStore({ newState: {
            semesters: semesterForCurrentUser,
            selectedSemesterId: '1'
         } }) });

         expect(effects.loadTimetable$).toBeObservable(expected);
         expect(timetableFetcherService.getSemestersForCurrentUser).toHaveBeenCalled();
      });
   });

   describe('updateTimetable$', () => {
      it(`should dispatch ${ timetableActions.saveTimetableToStore.type }, with the new state`, () => {
         const newState = {
            semesters: semesterForCurrentUser,
            selectedSemesterId: '1'
         };
         actions$ = cold('a', { a: timetableActions.updateTimetable({ newState }) });
         timetableFetcherService.saveSemesters.and.returnValue(of(undefined));

         const expected = cold('b', { b: timetableActions.saveTimetableToStore({ newState }) });

         expect(effects.updateTimetable$).toBeObservable(expected);
         expect(timetableFetcherService.saveSemesters).toHaveBeenCalledWith(newState.semesters);
      });
   });
});
