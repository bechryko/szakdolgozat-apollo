import { Injectable } from '@angular/core';
import { multicast } from '@apollo-shared/operators';
import { timetableActions, timetableFeature } from '@apollo-timetable/store';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged, tap } from 'rxjs';
import { Semester } from '../models';

@Injectable({
   providedIn: 'root'
})
export class TimetableService {
   public readonly semesters$: Observable<Semester[]>;
   public readonly selectedSemesterId$: Observable<string | undefined>;

   constructor(
      private readonly store: Store
   ) {
      this.semesters$ = this.store.select(timetableFeature.selectSemesters).pipe(
         tap(semesters => {
            if(!semesters.length) { // TODO: handle if database is empty
               this.store.dispatch(timetableActions.loadTimetable());
            }
         }),
         multicast(),
         distinctUntilChanged()
      );

      this.selectedSemesterId$ = this.store.select(timetableFeature.selectSelectedSemesterId).pipe(
         multicast(),
         distinctUntilChanged()
      );
   }

   public saveTimetableData(semesters: Semester[], selectedSemesterId?: string): void {
      this.store.dispatch(timetableActions.updateTimetable({ newState: { semesters, selectedSemesterId } }));
   }
}
