import { Injectable } from '@angular/core';
import { LoginData, RegisterData } from '@apollo/user/models';
import { AuthService, UserFetcherService } from '@apollo/user/services';
import { Store } from '@ngrx/store';
import { Observable, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { LanguageService } from '../languages';
import { LoadingService, LoadingType, authLoadingKey } from '../loading';
import { ApolloUser } from '../models';
import { multicast } from '../operators';
import { userActions } from '../store';

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
      private readonly store: Store,
      private readonly languageService: LanguageService,
      private readonly loadingService: LoadingService
   ) {
      this.loadingService.startLoading(authLoadingKey, LoadingType.AUTHENTICATION);

      this.user$ = this.authService.user$.pipe(
         map(user => user ? user.email : null),
         distinctUntilChanged(),
         switchMap(email => email ? this.userFetcherService.getUserDataChanges(email) : of(null)),
         map(user => this.extendUserWithPossiblyMissingFields(user)),
         tap(user => {
            if(user?.selectedLanguage) {
               this.languageService.setLanguage(user.selectedLanguage);
            }
            loadingService.finishLoading(authLoadingKey);
         }),
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

   private extendUserWithPossiblyMissingFields(user: ApolloUser | null): ApolloUser | null {
      if(!user) {
         return null;
      }

      const updatedUser = { ...user };
      if(!updatedUser.settings) {
         updatedUser.settings = {};
      }

      return updatedUser;
   }
}
