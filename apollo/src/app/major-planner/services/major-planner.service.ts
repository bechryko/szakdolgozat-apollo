import { Injectable } from '@angular/core';
import { multicast } from '@apollo/shared/operators';
import { Observable, of } from 'rxjs';
import { MajorPlan } from '../models';

@Injectable({
   providedIn: 'root'
})
export class MajorPlannerService {
   public readonly majorPlan$: Observable<MajorPlan>;

   constructor() {
      this.majorPlan$ = of({
         name: "My Little Plan",
         semesters: [
            {
               subjects: [
                  {
                     id: '1',
                     name: 'Subject 1',
                     credit: 3,
                     code: 'SUB1',
                     parallelConditions: ['SUB2']
                  },
                  {
                     id: '2',
                     name: 'Subject 2',
                     credit: 4,
                     code: 'SUB2',
                     parallelConditions: ['SUB1']
                  }
               ]
            },
            {
               subjects: [
                  {
                     id: '3',
                     name: 'Subject 3',
                     credit: 2,
                     code: 'SUB3',
                     preconditions: ['SUB1']
                  },
                  {
                     id: '4',
                     name: 'Subject 4',
                     credit: 3,
                     code: 'SUB4'
                  },
                  {
                     id: '6',
                     name: 'Subject 6',
                     credit: 5,
                     code: 'SUB6'
                  }
               ]
            },
            {
               subjects: [
                  {
                     id: '5',
                     name: 'Subject 5',
                     credit: 8,
                     code: 'SUB5',
                     preconditions: ['SUB4']
                  }
               ]
            }
         ]
      } as any).pipe(
         multicast()
      );
   }
}
