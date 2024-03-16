import { Injectable } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private readonly auth: Auth;
   public readonly user$: Observable<User | null>;

   constructor() {
      this.auth = getAuth();
      this.user$ = authState(this.auth);
   }

   public registerUser(email: string, password: string): Observable<void> {
      return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
         map(() => undefined)
      );
   }

   public signInUser(email: string, password: string): Observable<void> {
      return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
         map(() => undefined)
      );
   }

   public signOutUser(): Observable<void> {
      return from(signOut(this.auth));
   }
}
