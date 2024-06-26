import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map, take } from 'rxjs';
import { MenuCard } from '../models';

const COLLECTION = 'menu-cards';

@Injectable({
   providedIn: 'root'
})
export class MenuCardFetcherService {
   private readonly collection: CollectionReference;

   constructor(
      private readonly firestore: Firestore
   ) {
      this.collection = collection(this.firestore, COLLECTION);
   }

   public loadMenuCards(): Observable<MenuCard[]> {
      return collectionData(this.collection).pipe(
         take(1),
         map(data => data as MenuCard[])
      );
   }
}
