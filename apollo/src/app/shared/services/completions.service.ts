import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, distinctUntilChanged, filter, tap } from 'rxjs';
import { UniversityCompletionYear, UniversitySubject, UniversitySubjectCompletion } from '../models';
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
      this.universityCompletions$ = this.store.select(coreFeature.selectCompletions).pipe(
         tap(completions => {
            if(!completions) {
               this.store.dispatch(completionsActions.loadCompletions());
            }
         }),
         filter(Boolean),
         multicast(),
         distinctUntilChanged(isEqual)
      );
   }

   public saveUniversityCompletions(completions: UniversityCompletionYear[]): void {
      completions = cloneDeep(completions);

      const unassignedCompletionsCollector = completions.find(completion => completion.isUnassignedCompletionsCollector);
      if(unassignedCompletionsCollector) {
         const allOtherYears = completions.filter(completion => !completion.isUnassignedCompletionsCollector);
         const allCompletions = allOtherYears.reduce((acc, completion) => [...acc, ...completion.firstSemester, ...completion.secondSemester], [] as UniversitySubjectCompletion[]);
         unassignedCompletionsCollector.firstSemester.forEach((unassignedCompletion, idx) => {
            if(allCompletions.some(completion => completion.code === unassignedCompletion.code)) {
               unassignedCompletionsCollector.firstSemester.splice(idx, 1);
            }
         });

         if(unassignedCompletionsCollector.firstSemester.length === 0) {
            completions = completions.filter(completion => !completion.isUnassignedCompletionsCollector);
         }
      }

      this.store.dispatch(completionsActions.saveCompletions({ completions }));
   }

   public completeSubject(subject: UniversitySubject): void {
      this.store.dispatch(completionsActions.completeSubject({ subject }));
   }

   public deleteGuestData(): void {
      this.store.dispatch(completionsActions.deleteGuestData());
   }
}
