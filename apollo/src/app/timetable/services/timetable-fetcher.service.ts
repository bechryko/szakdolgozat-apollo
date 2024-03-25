import { Injectable } from '@angular/core';
import { CoreFetcherService } from '@apollo/shared/services/core-fetcher.service';
import { GuestStorageUtils } from '@apollo/shared/utils';
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
      return this.coreFetcherService.saveCollectionChangesForCurrentUser<Semester>(COLLECTION, semesters);
   }

   public clearGuestStorage(): void {
      GuestStorageUtils.clear(COLLECTION);
   }

   public getGuestStorageData(): Semester[] {
      return GuestStorageUtils.load(COLLECTION);
   }
}
