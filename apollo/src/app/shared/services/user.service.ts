import { Injectable } from '@angular/core';
import { LoginData, RegisterData } from '@apollo/user/models';
import { AuthService, UserFetcherService } from '@apollo/user/services';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ApolloUser } from '../models';
import { multicast } from '../operators';
import { userActions } from '../store/actions/user.actions';

@Injectable({
   providedIn: 'root'
})
export class UserService {
   public readonly user$: Observable<ApolloUser | null>;
   public readonly isUserLoggedIn$: Observable<boolean>;
   public readonly isUserAdmin$: Observable<boolean>;

   constructor(
      private readonly authService: AuthService,
      private readonly userFetcherService: UserFetcherService,
      private readonly store: Store
   ) {
      this.user$ = this.authService.user$.pipe(
         map(user => user ? user.email : null),
         distinctUntilChanged(),
         switchMap(email => email ? this.userFetcherService.getUserDataChanges(email) : of(null)),
         multicast()
      );

      this.isUserLoggedIn$ = this.user$.pipe(
         map(Boolean),
         multicast(),
         distinctUntilChanged()
      );

      this.isUserAdmin$ = this.user$.pipe(
         map(user => Boolean(user?.isAdmin)),
         multicast(),
         distinctUntilChanged()
      );
   }

   public login(loginData: LoginData): void {
      this.store.dispatch(userActions.login({ loginData }));
   }

   public register(registerData: RegisterData): void {
      this.store.dispatch(userActions.register({ registerData }));
   }

   public logout(): void {
      this.store.dispatch(userActions.logout());
   }

   public updateUser(user: ApolloUser): void {
      this.store.dispatch(userActions.updateUserProfile({ user }));
   }
}
