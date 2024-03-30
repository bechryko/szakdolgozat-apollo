import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, QueryFieldFilterConstraint, addDoc, collection, collectionData, deleteDoc, doc, docData, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { isEqual } from 'lodash';
import { Observable, from, map, of, switchMap, take } from 'rxjs';
import { ApolloUser, UniversitySubject } from '../models';
import { GuestStorageUtils } from '../utils';
import { UserService } from './user.service';

interface StoredValue {
   id: string;
}

interface UserStoredValue extends StoredValue {
   owner: string;
}

@Injectable({
   providedIn: 'root'
})
export class CoreFetcherService {
   constructor(
      private readonly firestore: Firestore,
      private readonly userService: UserService
   ) { }

   public getCollectionForCurrentUser<T extends UserStoredValue>(collectionName: string): Observable<T[]> {
      const _collection = collection(this.firestore, collectionName);

      return this.userService.user$.pipe(
         take(1),
         switchMap(user => {
            if (user === null) {
               return of(GuestStorageUtils.load<T>(collectionName));
            }

            const semesterQuery = query(_collection, where('owner', '==', user.email));
            return collectionData<T>(semesterQuery as any);
         }),
         take(1)
      );
   }

   public getCollection<T extends StoredValue>(collectionName: string, constraint?: QueryFieldFilterConstraint): Observable<T[]> {
      const _collection = collection(this.firestore, collectionName);

      if(collectionName === 'core-subjects-v2') {
         return collectionData<T>(query(_collection, constraint!) as any).pipe(
            take(1),
            map((value: any) => value[0]?.subjects ?? [])
         );
      }

      let collectionData$: Observable<T[]>;
      if (constraint) {
         collectionData$ = collectionData<T>(query(_collection, constraint) as any);
      } else {
         collectionData$ = collectionData<T>(query(_collection) as any);
      }
      return collectionData$.pipe(take(1));
   }

   public saveCollectionChangesForCurrentUser<T extends UserStoredValue>(collectionName: string, values: T[]): Observable<void> {
      return this.userService.user$.pipe(
         take(1),
         switchMap(user => {
            if (!user) {
               return of(GuestStorageUtils.save(collectionName, values));
            }

            return this.getCollectionForCurrentUser<T>(collectionName).pipe(
               switchMap(valuesOnBackend => this.processSaving(collectionName, values, valuesOnBackend, user))
            );
         })
      );
   }

   public saveCollectionChanges<T extends StoredValue>(collectionName: string, values: T[], constraint?: QueryFieldFilterConstraint): Observable<void> {
      return this.getCollection<T>(collectionName, constraint).pipe(
         switchMap(valuesOnBackend => this.processSaving(collectionName, values, valuesOnBackend))
      );
   }

   public saveDocChanges<T extends StoredValue>(collectionName: string, value: T): Observable<void> {
      const _collection = collection(this.firestore, collectionName);

      const ref = doc(_collection, value.id);
      return docData(ref).pipe(
         switchMap(existing => {
            if (existing) {
               if (!isEqual(existing, value)) {
                  return updateDoc(ref, value as any);
               }
               return of(undefined);
            }
            return addDoc(_collection, value);
         }),
         switchMap(reference => {
            if (!reference) {
               return of(undefined);
            }

            return updateDoc(reference, { id: reference.id });
         }),
         map(() => undefined)
      );
   }

   public deleteDoc(collectionName: string, id: string): Observable<void> {
      const _collection = collection(this.firestore, collectionName);

      return from(deleteDoc(doc(_collection, id))).pipe(
         map(() => undefined)
      );
   }

   private processSaving<T extends StoredValue>(collectionName: string, values: T[], valuesOnBackend: T[], user?: ApolloUser): Observable<void> {
      const _collection = collection(this.firestore, collectionName);

      if(collectionName === 'core-subjects-v2') {
         return this.processSavingForBypassSubjects(collectionName, values as any, valuesOnBackend as any);
      }

      const resolvables: Promise<void | DocumentReference>[] = [];

      values.forEach(value => {
         const existing = valuesOnBackend.find(existing => existing.id === value.id);
         if (existing) {
            if (!isEqual(existing, value)) {
               resolvables.push(updateDoc(doc(_collection, value.id), value as any));
            }
         } else {
            resolvables.push(addDoc(_collection, value));
         }
      });

      valuesOnBackend.filter(existing => !values.some(value => value.id === existing.id)).forEach(value => {
         resolvables.push(deleteDoc(doc(_collection, value.id)));
      });

      return from(Promise.all(resolvables)).pipe(
         switchMap(references => Promise.all(references.map(ref => {
            if (!ref) {
               return;
            }

            const updatableFields: any = { id: ref.id };
            if (user) {
               updatableFields.owner = user.email;
            }
            return updateDoc(ref, updatableFields);
         }))),
         map(() => undefined)
      );
   }

   private processSavingForBypassSubjects(collectionName: string, values: UniversitySubject[], valuesOnBackend: UniversitySubject[]): Observable<void> {
      const universityId = values[0]?.universityId ?? valuesOnBackend[0]?.universityId;
      if(!universityId) {
         return of(undefined);
      }
      
      const _collection = collection(this.firestore, collectionName);
      const document = doc(_collection, universityId);
      return from(setDoc(document, {
         universityId,
         subjects: values
      }));
   }
}
