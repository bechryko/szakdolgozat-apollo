import { Injectable } from '@angular/core';
import { multicast } from '@apollo/shared/operators';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged, filter, tap } from 'rxjs';
import { Semester } from '../models';
import { timetableActions, timetableFeature } from '../store';

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
            if(!semesters) { // TODO: handle if database is empty
               this.store.dispatch(timetableActions.loadTimetable());
            }
         }),
         filter(Boolean),
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

   public deleteGuestData(): void {
      this.store.dispatch(timetableActions.deleteGuestData());
   }
}
