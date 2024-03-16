import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, filter, map, tap } from 'rxjs';
import { UniversityCompletionYear } from '../models';
import { multicast } from '../operators';
import { completionsActions, coreFeature } from '../store';

@Injectable({
   providedIn: 'root'
})
export class CompletionsService {
   public readonly universityCompletions$: Observable<UniversityCompletionYear[]>;

   constructor(
      private readonly store: Store
   ) {
      this.universityCompletions$ = this.store.select(coreFeature.selectCompletionYears).pipe(
         tap(completions => {
            if(!completions) {
               this.store.dispatch(completionsActions.loadCompletions());
            }
         }),
         filter(completions => Boolean(completions)),
         map(completions => completions!),
         multicast(),
         distinctUntilChanged(isEqual)
      );
   }

   public saveUniversityCompletions(completions: UniversityCompletionYear[]): void {
      this.store.dispatch(completionsActions.saveCompletions({ completions }));
   }
}
