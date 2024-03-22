import { Injectable } from "@angular/core";
import { GeneralDialogService } from "@apollo/shared/general-dialog";
import { CompletionsFetcherService, SnackBarService } from "@apollo/shared/services";
import { TimetableFetcherService } from "@apollo/timetable/services/timetable-fetcher.service";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, filter, map, merge, of, partition, switchMap, tap } from "rxjs";
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
         switchMap(() => {
            const averagesData = this.completionsFetcherService.getGuestStorageData();
            const timetableData = this.timetableFetcherService.getGuestStorageData();

            if (averagesData.length === 0 && timetableData.length === 0) {
               return of(userActions.clearUserData());
            }

            let content = "AUTH.GUEST_DATA_TRANSFER_DIALOG.CONTENT.";
            if (averagesData.length > 0 && timetableData.length > 0) {
               content += "BOTH";
            } else if (averagesData.length > 0) {
               content += "AVERAGES";
            } else {
               content += "TIMETABLE";
            }

            const [doTransferData$, doNotTransferData$] = partition(
               this.generalDialog.openDialog({
                  title: "AUTH.GUEST_DATA_TRANSFER_DIALOG.TITLE",
                  content,
                  accept: "AUTH.GUEST_DATA_TRANSFER_DIALOG.ACCEPT",
                  cancel: "AUTH.GUEST_DATA_TRANSFER_DIALOG.REJECT"
               }),
               doTransfer => doTransfer
            );

            return merge(
               doTransferData$.pipe(
                  switchMap(() => merge(
                     this.completionsFetcherService.saveCompletions(averagesData),
                     this.timetableFetcherService.saveSemesters(timetableData)
                  )),
                  tap(() => {
                     this.completionsFetcherService.clearGuestStorage();
                     this.timetableFetcherService.clearGuestStorage();
                  }),
                  catchError(error => {
                     // TODO: error handling
                     return [];
                  })
               ),
               doNotTransferData$.pipe(
                  map(() => userActions.clearUserData())
               )
            );
         }),
         filter(value => Boolean(value)),
         map(value => value!),
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
      private readonly snackbar: SnackBarService,
      private readonly generalDialog: GeneralDialogService,
      private readonly completionsFetcherService: CompletionsFetcherService,
      private readonly timetableFetcherService: TimetableFetcherService
   ) { }
}
