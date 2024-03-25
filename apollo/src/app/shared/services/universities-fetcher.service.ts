import { Injectable } from '@angular/core';
import { CoreFetcherService } from '@apollo/shared/services';
import { Observable } from 'rxjs';
import { University } from '../models';

const COLLECTION = 'core-universities';

@Injectable({
   providedIn: 'root'
})
export class UniversitiesFetcherService {
   constructor(
      private readonly coreFetcherService: CoreFetcherService
   ) { }

   public getUniversities(): Observable<University[]> {
      return this.coreFetcherService.getCollection<University>(COLLECTION);
   }

   public saveUniversities(universities: University[]): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<University>(COLLECTION, universities);
   }
}
