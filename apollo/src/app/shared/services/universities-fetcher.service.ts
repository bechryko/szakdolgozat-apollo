import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { CoreFetcherService } from '@apollo/shared/services';
import { Observable } from 'rxjs';
import { bypassFirebaseFreePlan } from '../constants';
import { University, UniversityMajor, UniversitySubject } from '../models';

const UNIVERSITY_COLLECTION = 'core-universities';
const SUBJECT_COLLECTION = bypassFirebaseFreePlan ? 'core-subjects-v2' : 'core-subjects';
const MAJOR_COLLECTION = 'core-majors';

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

   public getMajorsForUniversity(universityId: string): Observable<UniversityMajor[]> {
      return this.coreFetcherService.getCollection<UniversityMajor>(MAJOR_COLLECTION, where('universityId', '==', universityId));
   }

   public getMajor(majorId: string): Observable<UniversityMajor | undefined> {
      return this.coreFetcherService.getDoc<UniversityMajor>(MAJOR_COLLECTION, majorId);
   }

   public saveUniversityMajors(majors: UniversityMajor[], universityId: string): Observable<void> {
      return this.coreFetcherService.saveCollectionChanges<UniversityMajor>(
         MAJOR_COLLECTION,
         majors,
         where('universityId', '==', universityId)
      );
   }

   public saveSingleUniversityMajor(major: UniversityMajor): Observable<void> {
      return this.coreFetcherService.saveDocChanges<UniversityMajor>(MAJOR_COLLECTION, major);
   }
}
