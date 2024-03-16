import { Injectable } from "@angular/core";
import { SnackBarService } from "@apollo/shared/services";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, switchMap, tap } from "rxjs";
import { userActions } from "../actions/user.actions";

@Injectable()
export class UserEffects {
   public readonly login$ = createEffect(() => 
      this.actions$.pipe(
         ofType(userActions.login),
         switchMap(({ loginData }) => this.authService.signInUser(loginData.email, loginData.password)),
         map(() => userActions.clearUserData()),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly register$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.register),
         switchMap(({ registerData }) => this.authService.registerUser(registerData.email, registerData.password).pipe(
            switchMap(() => this.userFetcherService.saveNewUserData(registerData))
         )),
         map(() => userActions.clearUserData()),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );

   public readonly updateUserProfile$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.updateUserProfile),
         switchMap(({ user }) => this.userFetcherService.updateUserData(user)),
         tap(() => {
            this.snackbar.open("PROFILE.SETTINGS.SAVE_SUCCESS_MESSAGE");
         }),
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
         map(() => userActions.clearUserData()),
         catchError(error => {
            // TODO: error handling
            return [];
         })
      )
   );
   
   constructor(
      private readonly actions$: Actions,
      private readonly authService: AuthService,
      private readonly userFetcherService: UserFetcherService,
      private readonly snackbar: SnackBarService
   ) { }
}
