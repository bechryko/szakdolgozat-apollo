import { Injectable } from '@angular/core';
import { coreFeature, universityMajorActions, universitySubjectActions } from '@apollo/shared/store';
import { Store } from '@ngrx/store';
import { cloneDeep, isEqual } from 'lodash';
import { Observable, distinctUntilChanged, filter, map, take, tap } from 'rxjs';
import { University, UniversityMajor, UniversitySubject } from '../models';
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

   public getSubjectsForUniversity(universityId: string): Observable<UniversitySubject[]> {
      let retried = false;
      const retry = () => {
         this.store.dispatch(universitySubjectActions.loadUniversitySubjects({ universityId }));
         retried = true;
      };

      return this.store.select(coreFeature.selectUniversitySubjects).pipe(
         tap(subjects => {
            if(!subjects) {
               retry();
            }
         }),
         filter(Boolean),
         map(subjects => subjects.filter(subject => subject.universityId === universityId)),
         tap(subjects => {
            if(!retried && subjects.length === 0) {
               retry();
            }
         }),
         distinctUntilChanged(isEqual)
      );
   }

   public getMajorsForUniversity(universityId: string): Observable<UniversityMajor[]> {
      let retried = false;
      const retry = () => {
         this.store.dispatch(universityMajorActions.loadUniversityMajors({ universityId }));
         retried = true;
      };

      return this.store.select(coreFeature.selectUniversityMajors).pipe(
         tap(majors => {
            if(!majors) {
               retry();
            }
         }),
         filter(Boolean),
         map(majors => majors.filter(major => major.universityId === universityId)),
         tap(majors => {
            if(!retried && majors.length === 0) {
               retry();
            }
         }),
         distinctUntilChanged(isEqual)
      );
   }

   public getMajor(majorId: string): Observable<UniversityMajor | undefined> {
      let retried = false;
      const retry = () => {
         this.store.dispatch(universityMajorActions.loadSingleUniversityMajor({ majorId }));
         retried = true;
      };

      return this.store.select(coreFeature.selectUniversityMajors).pipe(
         tap(majors => {
            if(!majors) {
               retry();
            }
         }),
         filter(Boolean),
         map(majors => {
            const major = majors.find(major => major.id === majorId);

            if(!retried && !major) {
               retry();
               return [];
            }
            return major;
         }),
         distinctUntilChanged(isEqual)
      );
   }

   public saveAll(universitySubjects: UniversitySubject[], universityMajors: UniversityMajor[], universityId: string): void {
      this.store.dispatch(universitySubjectActions.saveUniversitySubjects({ universitySubjects, universityId }));
      this.store.dispatch(universityMajorActions.saveUniversityMajors({ universityMajors, universityId }));
   }

   public saveSingleUniversitySubject(universitySubject: UniversitySubject): void {
      this.store.dispatch(universitySubjectActions.saveSingleUniversitySubject({ universitySubject }));
   }

   public saveSingleUniversityMajor(universityMajor: UniversityMajor): void {
      this.store.dispatch(universityMajorActions.saveSingleUniversityMajor({ universityMajor }));
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
