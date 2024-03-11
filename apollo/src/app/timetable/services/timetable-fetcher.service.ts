import { Injectable } from '@angular/core';
import { CoreFetcherService } from '@apollo/shared/services/core-fetcher.service';
import { Observable } from 'rxjs';
import { Semester } from '../models';

const COLLECTION = 'timetable-semesters';

@Injectable({
   providedIn: 'root'
})
export class TimetableFetcherService {
   constructor(
      private readonly coreFetcherService: CoreFetcherService
   ) { }

   public getSemestersForCurrentUser(): Observable<Semester[]> {
      return this.coreFetcherService.getCollectionForCurrentUser<Semester>(COLLECTION);
   }

   public saveSemesters(semesters: Semester[]): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<Semester>(COLLECTION, semesters);
   }
}
