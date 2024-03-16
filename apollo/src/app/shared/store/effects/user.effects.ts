import { Injectable } from "@angular/core";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, switchMap } from "rxjs";
import { userActions } from "../actions/user.actions";

@Injectable()
export class UserEffects {
   public readonly login$ = createEffect(() => 
      this.actions$.pipe(
         ofType(userActions.login),
         switchMap(({ loginData }) => this.authService.signInUser(loginData.email, loginData.password)),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      ), { dispatch: false }
   );

   public readonly register$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.register),
         switchMap(({ registerData }) => this.authService.registerUser(registerData.email, registerData.password).pipe(
            switchMap(() => this.userFetcherService.saveNewUserData(registerData))
         )),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      ), { dispatch: false }
   );

   public readonly updateUserProfile$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.updateUserProfile),
         switchMap(({ user }) => this.userFetcherService.updateUserData(user)),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      ), { dispatch: false }
   );

   public readonly logout$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.logout),
         switchMap(() => this.authService.signOutUser()),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      ), { dispatch: false }
   );
   
   constructor(
      private readonly actions$: Actions,
      private readonly authService: AuthService,
      private readonly userFetcherService: UserFetcherService
   ) { }
}
