import { Injectable } from '@angular/core';
import { coreFeature } from '@apollo/shared/store';
import { Store } from '@ngrx/store';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, distinctUntilChanged, filter, take, tap } from 'rxjs';
import { University } from '../models';
import { multicast } from '../operators';
import { universityActions } from '../store';

let newUniversities = 0;

@Injectable({
   providedIn: 'root'
})
export class UniversitiesService {
   public readonly universities$: Observable<University[]>;

   constructor(
      private readonly store: Store
   ) {
      this.universities$ = this.store.select(coreFeature.selectUniversities).pipe(
         tap(universities => {
            if(!universities) {
               this.store.dispatch(universityActions.loadUniversities());
            }
         }),
         filter(Boolean),
         multicast(),
         distinctUntilChanged(isEqual)
      );
   }

   public saveUniversities(universities: University[]): void {
      this.store.dispatch(universityActions.saveUniversities({ universities }));
   }

   public addUniversity(): void {
      this.universities$.pipe(take(1)).subscribe(universities => {
         universities = cloneDeep(universities);
         universities.push(this.getDefaultUniversity());
         this.saveUniversities(universities);
      });
   }

   private getDefaultUniversity(): University {
      return {
         id: 'new-' + newUniversities++,
         name: {
            en: 'New University'
         },
         location: {
            en: ''
         },
         faculties: []
      };
   }
}
