import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UniversityCompletionYear } from '../models';
import { CoreFetcherService } from './core-fetcher.service';

const COLLECTION = 'core-completions';

@Injectable({
   providedIn: 'root'
})
export class CompletionsFetcherService {
   constructor(
      private readonly coreFetcherService: CoreFetcherService
   ) { }

   public getCompletionsForCurrentUser(): Observable<UniversityCompletionYear[]> {
      return this.coreFetcherService.getCollectionForCurrentUser<UniversityCompletionYear>(COLLECTION);
   }

   public saveCompletions(completions: UniversityCompletionYear[]): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<UniversityCompletionYear>(COLLECTION, completions);
   }
}