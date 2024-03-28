import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { CoreFetcherService } from '@apollo/shared/services';
import { Observable } from 'rxjs';
import { University, UniversitySubject } from '../models';

const UNIVERSITY_COLLECTION = 'core-universities';
const SUBJECT_COLLECTION = 'core-subjects';

@Injectable({
   providedIn: 'root'
})
export class UniversitiesFetcherService {
   constructor(
      private readonly coreFetcherService: CoreFetcherService
   ) { }

   public getUniversities(): Observable<University[]> {
      return this.coreFetcherService.getCollection<University>(UNIVERSITY_COLLECTION);
   }

   public saveUniversities(universities: University[]): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<University>(UNIVERSITY_COLLECTION, universities);
   }

   public getSubjectsForUniversity(universityId: string): Observable<UniversitySubject[]> {
      return this.coreFetcherService.getCollection<UniversitySubject>(SUBJECT_COLLECTION, where('universityId', '==', universityId));
   }

   public saveUniversitySubjects(subjects: UniversitySubject[], universityId: string): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<UniversitySubject>(
         SUBJECT_COLLECTION,
         subjects,
         where('universityId', '==', universityId)
      );
   }

   public saveSingleUniversitySubject(subject: UniversitySubject): Observable<void> {
      return this.coreFetcherService.saveDocChanges<UniversitySubject>(SUBJECT_COLLECTION, subject);
   }
}
