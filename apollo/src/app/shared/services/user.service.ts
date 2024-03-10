import { Injectable } from '@angular/core';
import { User } from '@apollo-shared/models';
import { multicast } from '@apollo-shared/operators';
import { Observable, of } from 'rxjs';

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
