import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CompletionYear } from '../models';

@Injectable({
   providedIn: 'root'
})
export class AveragesService {
   public readonly grades$: Observable<CompletionYear[]>;

   constructor() {
      this.grades$ = of([
         {
            name: '2022-23',
            firstSemesterGrades: [
               { rating: 2, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 3, credit: 2 },
               { rating: 4, credit: 1 },
               { rating: 5, credit: 1 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 3, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 3, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 1 },
               { rating: 4, credit: 2 },
               { rating: 5, credit: 3 },
            ],
            secondSemesterGrades: [
               { rating: 4, credit: 2 },
               { rating: 5, credit: 3 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 1 },
               { rating: 4, credit: 2 },
               { rating: 4, credit: 1 },
               { rating: 5, credit: 1 },
               { rating: 5, credit: 0 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 1 },
               { rating: 5, credit: 3 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 4, credit: 2 },
               { rating: 5, credit: 2 },
               { rating: 5, credit: 2 }
            ]
         },
         {
            name: '2020',
            firstSemesterGrades: [
               { rating: 5, credit: 6 },
               { rating: 4, credit: 6 },
               { rating: 3, credit: 6 },
               { rating: 2, credit: 6 }
            ],
            secondSemesterGrades: [
               { rating: 5, credit: 6 },
               { rating: 4, credit: 6 },
               { rating: 3, credit: 6 },
               { rating: 2, credit: 6 }
            ]
         }
      ]);
   }
}
