import { Injectable } from '@angular/core';
import { CollectionReference, DocumentReference, Firestore, addDoc, collection, collectionData, deleteDoc, doc, query, updateDoc, where } from '@angular/fire/firestore';
import { UserService } from '@apollo/shared/services';
import { Observable, from, map, switchMap, take } from 'rxjs';
import { Semester } from '../models';

const COLLECTION = 'timetable-semesters';

@Injectable({
   providedIn: 'root'
})
export class TimetableFetcherService {
   private readonly semesterCollection: CollectionReference;

   constructor(
      private readonly firestore: Firestore,
      private readonly userService: UserService
   ) {
      this.semesterCollection = collection(this.firestore, COLLECTION);
   }

   public getSemestersForCurrentUser(): Observable<Semester[]> {
      return this.userService.user$.pipe(
         switchMap(user => {
            if (user === null) {
               return [];
            }

            const semesterQuery = query(this.semesterCollection, where('owner', '==', user.email));
            return collectionData<Semester>(semesterQuery as any);
         }),
         take(1)
      );
   }

   public saveSemesters(semesters: Semester[]): Observable<void> {
      return this.userService.user$.pipe(
         switchMap(user => {
            if (!user) {
               throw new Error("ERROR.USER_NOT_LOGGED_IN");
            }

            return this.getSemestersForCurrentUser().pipe(
               switchMap(existingSemesters => {
                  const resolvables: Promise<void | DocumentReference>[] = [];

                  semesters.forEach(semester => {
                     if (existingSemesters.some(existing => existing.id === semester.id)) {
                        resolvables.push(updateDoc(doc(this.semesterCollection, semester.id), semester as any));
                     } else {
                        resolvables.push(addDoc(this.semesterCollection, semester));
                     }
                  });

                  existingSemesters.filter(existing => !semesters.some(semester => semester.id === existing.id)).forEach(semester => {
                     resolvables.push(deleteDoc(doc(this.semesterCollection, semester.id)));
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
