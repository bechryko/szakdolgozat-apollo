import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Semester } from '../models';

@Injectable({
   providedIn: 'root'
})
export class TimetableService {
   public readonly semesters$: Observable<Semester[]>;

   constructor() {
      this.semesters$ = of([
         {
            name: 'Fall 2020',
            activities: [
               {
                  name: 'Lecture',
                  courseCode: 'CSC207',
                  location: 'Online',
                  time: {
                     day: 1,
                     startingHour: 10,
                     startingMinute: 0,
                     length: 90
                  }
               },
               {
                  name: 'Tutorial',
                  courseCode: 'CSC207',
                  location: 'Online',
                  time: {
                     day: 3,
                     startingHour: 11,
                     startingMinute: 0,
                     length: 45
                  }
               },
               {
                  name: 'Lecture',
                  courseCode: 'CSC373',
                  location: 'Online',
                  time: {
                     day: 2,
                     startingHour: 10,
                     startingMinute: 30,
                     length: 90
                  }
               },
               {
                  name: 'Tutorial',
                  courseCode: 'CSC373',
                  location: 'Online',
                  time: {
                     day: 4,
                     startingHour: 16,
                     startingMinute: 0,
                     length: 180
                  }
               }
            ]
         }
      ]);
   }
}
