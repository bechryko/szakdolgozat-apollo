import { Injectable } from "@angular/core";
import { GeneralDialogService } from "@apollo/shared/general-dialog";
import { LoadingService, LoadingType, authCRUDLoadingKey, userUpdateLoadingKey } from "@apollo/shared/loading";
import { catchAndNotifyError } from "@apollo/shared/operators";
import { CompletionsFetcherService, SnackBarService, UserService } from "@apollo/shared/services";
import { TimetableFetcherService } from "@apollo/timetable/services";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { cloneDeep } from "lodash";
import { filter, map, merge, of, partition, switchMap, take, tap } from "rxjs";
import { userActions } from "../actions";

@Injectable()
export class UserEffects {
   public readonly login$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.login),
         tap(() => this.loadingService.startLoading(authCRUDLoadingKey, LoadingType.AUTHENTICATION)),
         switchMap(({ loginData }) => this.authService.signInUser(loginData.email, loginData.password).pipe(
            map(() => {
               this.loadingService.finishLoading(authCRUDLoadingKey);
               return userActions.clearUserData();
            }),
            catchAndNotifyError(authCRUDLoadingKey, "ERROR.AUTH.LOGIN")
         ))
      )
   );

   public readonly register$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.register),
         tap(() => this.loadingService.startLoading(authCRUDLoadingKey, LoadingType.AUTHENTICATION)),
         switchMap(({ registerData }) => this.authService.registerUser(registerData.email, registerData.password).pipe(
            switchMap(() => this.userFetcherService.saveNewUserData(registerData).pipe(
               catchAndNotifyError(authCRUDLoadingKey, "ERROR.DATABASE.USER_SAVE")
            )),
            catchAndNotifyError(authCRUDLoadingKey, "ERROR.AUTH.REGISTER")
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
                  ).pipe(
                     map(() => null),
                     catchAndNotifyError(authCRUDLoadingKey, "ERROR.DATABASE.GUEST_DATA_TRANSFER")
                  )),
                  tap(() => {
                     this.completionsFetcherService.clearGuestStorage();
                     this.timetableFetcherService.clearGuestStorage();
                  })
               ),
               doNotTransferData$.pipe(
                  map(() => userActions.clearUserData())
               )
            );
         }),
         tap(() => this.loadingService.finishLoading(authCRUDLoadingKey)),
         filter(Boolean)
      )
   );

   public readonly updateUserProfile$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.updateUserProfile),
         tap(() => this.loadingService.startLoading(userUpdateLoadingKey, LoadingType.SAVE)),
         switchMap(({ user }) => this.userFetcherService.updateUserData(user).pipe(
            catchAndNotifyError(userUpdateLoadingKey, "ERROR.DATABASE.USER_UPDATE")
         )),
         tap(() => {
            this.loadingService.finishLoading(userUpdateLoadingKey);
            this.snackbarService.open("PROFILE.SETTINGS.SAVE_SUCCESS_MESSAGE");
         })
      ), { dispatch: false }
   );

   public readonly updateUserSetting$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.updateUserSetting),
         switchMap(({ key, value }) => this.userService.user$.pipe(
            take(1),
            map(user => {
               if (!user || user.settings[key] === value) {
                  return null;
               }

               const updatedUser = cloneDeep(user);
               updatedUser.settings[key] = value;
               
               return userActions.updateUserProfile({ user: updatedUser });
            })
         )),
         filter(Boolean)
      )
   );

   public readonly logout$ = createEffect(() =>
      this.actions$.pipe(
         ofType(userActions.logout),
         tap(() => this.loadingService.startLoading(authCRUDLoadingKey, LoadingType.AUTHENTICATION)),
         switchMap(() => this.authService.signOutUser().pipe(
            catchAndNotifyError(
               authCRUDLoadingKey,
               Math.random() >= 0.01 ? "ERROR.AUTH.LOGOUT" : "ERROR.AUTH.LOGOUT_2"
            )
         )),
         map(() => {
            this.loadingService.finishLoading(authCRUDLoadingKey);
            return userActions.clearUserData();
         })
      )
   );

   constructor(
      private readonly actions$: Actions,
      private readonly authService: AuthService,
      private readonly userFetcherService: UserFetcherService,
      private readonly snackbarService: SnackBarService,
      private readonly generalDialog: GeneralDialogService,
      private readonly completionsFetcherService: CompletionsFetcherService,
      private readonly timetableFetcherService: TimetableFetcherService,
      private readonly loadingService: LoadingService,
      private readonly userService: UserService
   ) { }
}
