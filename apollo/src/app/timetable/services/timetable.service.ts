import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivityCategory, Semester } from '../models';

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
                  name: 'Lecture1',
                  courseCode: 'CSC207',
                  location: 'Online',
                  time: {
                     day: 1,
                     startingHour: 4,
                     startingMinute: 0,
                     length: 90
                  },
                  category: {
                     color: '#0000ff',
                     temporary: true
                  } as ActivityCategory
               },
               {
                  name: 'Tutorial1',
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
                  name: 'Lecture2',
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
                  name: 'Tutorial2',
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
