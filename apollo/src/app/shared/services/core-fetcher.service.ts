import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData, deleteDoc, doc, query, updateDoc, where } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, take } from 'rxjs';
import { UserService } from './user.service';

interface StoredValue {
   id: string;
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

   public getCollectionForCurrentUser<T extends StoredValue>(collectionName: string): Observable<T[]> {
      const _collection = collection(this.firestore, collectionName);

      return this.userService.user$.pipe(
         switchMap(user => {
            if (user === null) {
               return [];
            }

            const semesterQuery = query(_collection, where('owner', '==', user.email));
            return collectionData<T>(semesterQuery as any);
         }),
         take(1)
      );
   }

   public saveCollectionChanges<T extends StoredValue>(collectionName: string, values: T[]): Observable<void> {
      const _collection = collection(this.firestore, collectionName);

      return this.userService.user$.pipe(
         switchMap(user => {
            if (!user) {
               throw new Error("ERROR.USER_NOT_LOGGED_IN");
            }

            return this.getCollectionForCurrentUser<T>(collectionName).pipe(
               switchMap(valuesOnBackend => {
                  const resolvables: Promise<void | DocumentReference>[] = [];

                  values.forEach(value => {
                     if (valuesOnBackend.some(existing => existing.id === value.id)) {
                        resolvables.push(updateDoc(doc(_collection, value.id), value as any));
                     } else {
                        resolvables.push(addDoc(_collection, value));
                     }
                  });

                  valuesOnBackend.filter(existing => !values.some(value => value.id === existing.id)).forEach(value => {
                     resolvables.push(deleteDoc(doc(_collection, value.id)));
                  });

                  return from(Promise.all(resolvables));
               }),
               switchMap(references =>
                  from(Promise.all(references.map(ref => {
                     if (!ref) {
                        return;
                     }

                     return updateDoc(ref, {
                        id: ref.id,
                        owner: user.email
                     });
                  })))
               )
            )
         }),
         map(() => undefined)
      );
   }
}
