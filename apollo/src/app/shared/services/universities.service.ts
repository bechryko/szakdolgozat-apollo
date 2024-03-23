import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { University } from '../models';
import { multicast } from '../operators';

@Injectable({
   providedIn: 'root'
})
export class UniversitiesService {
   public readonly universities$: Observable<University[]>;

   constructor() {
      this.universities$ = of([
         {
            id: '1',
            name: {
               en: "University of Szeged",
               hu: "Szegedi Tudományegyetem"
            },
            location: {
               en: "Szeged, Hungary",
               hu: "Szeged, Magyarország"
            },
            faculties: [
               {
                  en: "Faculty of Science and Informatics",
                  hu: "Természettudományi és Informatikai Kar"
               },
               {
                  en: "Faculty of Law",
                  hu: "Jogi Kar"
               }
            ]
         },
         {
            id: '2',
            name: {
               en: "University of Debrecen",
               hu: "Debreceni Egyetem"
            },
            location: {
               en: "Debrecen, Hungary",
               hu: "Debrecen, Magyarország"
            },
            faculties: [
               {
                  en: "Faculty of Medicine",
                  hu: "Orvostudományi Kar"
               },
               {
                  en: "Faculty of Arts and Humanities",
                  hu: "Bölcsészettudományi Kar"
               }
            ]
         }
      ] as University[]).pipe(
         multicast()
      );
   }
}
