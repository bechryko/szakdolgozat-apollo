import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, doc, docData, updateDoc } from '@angular/fire/firestore';
import { ApolloUser } from '@apollo/shared/models';
import { setDoc } from '@firebase/firestore';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, from, map } from 'rxjs';
import { RegisterData } from '../models';

const COLLECTION = "auth-user";

@Injectable({
   providedIn: 'root'
})
export class UserFetcherService {
   private readonly collection: CollectionReference;
   
   constructor(
      private readonly firestore: Firestore
   ) {
      this.collection = collection(this.firestore, COLLECTION);
   }

   public getUserDataChanges(userEmail: string): Observable<ApolloUser> {
      return (docData(doc(this.collection, userEmail)) as Observable<ApolloUser>).pipe(
         distinctUntilChanged(isEqual)
      );
   }

   public saveNewUserData(userData: RegisterData): Observable<ApolloUser> {
      const user: ApolloUser = {
         email: userData.email,
         username: userData.username,
         isAdmin: false,
         settings: {}
      };
      return from(setDoc(doc(this.collection, user.email), user)).pipe(
         map(() => user)
      );
   }

   public updateUserData(user: ApolloUser): Observable<void> {
      return from(updateDoc(doc(this.collection, user.email), user as any)).pipe(
         map(() => undefined)
      );
   }
}
