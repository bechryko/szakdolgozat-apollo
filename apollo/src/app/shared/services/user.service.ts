import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models';
import { multicast } from '../operators';

@Injectable({
   providedIn: 'root'
})
export class UserService {
   public readonly user$: Observable<User | null>;

   constructor() {
      this.user$ = of({
         email: "bechryko@gmail.com"
      }).pipe(
         multicast()
      );
   }
}
