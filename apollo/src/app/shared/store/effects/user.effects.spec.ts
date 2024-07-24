import { TestBed } from "@angular/core/testing";
import { GeneralDialogService } from "@apollo/shared/general-dialog";
import { ApolloUser, UniversityCompletionYear } from "@apollo/shared/models";
import { registerCatchAndNotifyErrorOperator } from "@apollo/shared/operators/catch-and-notify-error";
import { CompletionsFetcherService, SnackBarService, UserService } from "@apollo/shared/services";
import { Semester } from "@apollo/timetable/models";
import { TimetableFetcherService } from "@apollo/timetable/services/timetable-fetcher.service";
import { LoginData, RegisterData } from "@apollo/user/models";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { BehaviorSubject, of } from "rxjs";
import { userActions } from "../actions";
import { UserEffects } from "./user.effects";

describe('UserEffects', () => {
   let effects: UserEffects;
   let actions$: TestColdObservable;
   let authService: jasmine.SpyObj<AuthService>;
   let userFetcherService: jasmine.SpyObj<UserFetcherService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;
   let generalDialog: jasmine.SpyObj<GeneralDialogService>;
   let completionsFetcherService: jasmine.SpyObj<CompletionsFetcherService>;
   let timetableFetcherService: jasmine.SpyObj<TimetableFetcherService>;

   let user$: BehaviorSubject<ApolloUser | null>;

   const loginData: LoginData = {
      email: 'test@email.com',
      password: 'testPassword'
   };

   const registerData: RegisterData = {
      email: 'test@email.com',
      username: 'testUsername',
      password: 'testPassword'
   };

   const user = {
      email: 'testEmail',
      username: 'testUsername'
   } as ApolloUser;

   function authServiceFactory() {
      const service = jasmine.createSpyObj('AuthService', ['signInUser', 'registerUser', 'signOutUser']);
      service.signInUser.and.returnValue(of(undefined));
      service.registerUser.and.returnValue(of(undefined));
      service.signOutUser.and.returnValue(of(undefined));
      return service;
   }

   function userFetcherServiceFactory() {
      const service = jasmine.createSpyObj('UserFetcherService', ['updateUserData', 'saveNewUserData']);
      service.updateUserData.and.returnValue(of(undefined));
      service.saveNewUserData.and.returnValue(of(undefined));
      return service;
   }

   function completionsFetcherServiceFactory() {
      const service = jasmine.createSpyObj('CompletionsFetcherService', ['getGuestStorageData', 'saveCompletions', 'clearGuestStorage']);
      service.getGuestStorageData.and.returnValue([]);
      service.saveCompletions.and.returnValue(of(undefined));
      return service;
   }

   function timetableFetcherServiceFactory() {
      const service = jasmine.createSpyObj('TimetableFetcherService', ['getGuestStorageData', 'saveSemesters', 'clearGuestStorage']);
      service.getGuestStorageData.and.returnValue([]);
      service.saveSemesters.and.returnValue(of(undefined));
      return service;
   }

   function userServiceFactory() {
      return {
         user$
      };
   }

   beforeEach(() => {
      user$ = new BehaviorSubject<ApolloUser | null>(null);

      TestBed.configureTestingModule({
         providers: [
            UserEffects,
            provideMockActions(() => actions$),
            {
               provide: AuthService,
               useFactory: authServiceFactory
            },
            {
               provide: UserFetcherService,
               useFactory: userFetcherServiceFactory
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['open', 'openError'])
            },
            {
               provide: GeneralDialogService,
               useValue: jasmine.createSpyObj('GeneralDialogService', ['openDialog'])
            },
            {
               provide: CompletionsFetcherService,
               useFactory: completionsFetcherServiceFactory
            },
            {
               provide: TimetableFetcherService,
               useFactory: timetableFetcherServiceFactory
            },
            {
               provide: UserService,
               useFactory: userServiceFactory
            }
         ]
      });

      effects = TestBed.inject(UserEffects);
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      userFetcherService = TestBed.inject(UserFetcherService) as jasmine.SpyObj<UserFetcherService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      generalDialog = TestBed.inject(GeneralDialogService) as jasmine.SpyObj<GeneralDialogService>;
      completionsFetcherService = TestBed.inject(CompletionsFetcherService) as jasmine.SpyObj<CompletionsFetcherService>;
      timetableFetcherService = TestBed.inject(TimetableFetcherService) as jasmine.SpyObj<TimetableFetcherService>;

      generalDialog.openDialog.and.returnValue(of(false));

      registerCatchAndNotifyErrorOperator(jasmine.createSpyObj('LoadingService', ['finishLoading']), snackbarService);
   });

   describe('login$', () => {
      it("should sign in through userService", () => {
         actions$ = cold('a', { a: userActions.login({ loginData }) });

         effects.login$.subscribe();
         getTestScheduler().flush();

         expect(authService.signInUser).toHaveBeenCalledWith(loginData.email, loginData.password);
      });

      it(`should dispatch ${ userActions.clearUserData.type } action after successful login`, () => {
         actions$ = cold('a', { a: userActions.login({ loginData }) });

         const expected = cold('b', { b: userActions.clearUserData() });

         expect(effects.login$).toBeObservable(expected);
      });

      it("should notify the user with a snackbar message if login fails", () => {
         authService.signInUser.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.login({ loginData }) });

         expect(effects.login$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.AUTH.LOGIN");
      });
   });

   describe('register$', () => {
      const completion = {
         id: 'testId',
         name: 'testYearName',
         owner: 'testOwner'
      } as UniversityCompletionYear;
      
      const semester = {
         id: 'testId',
         name: 'testSemesterName',
         owner: 'testOwner'
      } as Semester;

      it("should register a new user", () => {
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(authService.registerUser).toHaveBeenCalledWith(registerData.email, registerData.password);
      });

      it(`should dispatch ${ userActions.clearUserData.type } action after successful registration if there is no saved guest data`, () => {
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         const expected = cold('b', { b: userActions.clearUserData() });

         expect(effects.register$).toBeObservable(expected);
      });

      it("should open dialog with correct content if there is saved guest data on the averages page", () => {
         completionsFetcherService.getGuestStorageData.and.returnValue([{} as UniversityCompletionYear]);
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(generalDialog.openDialog).toHaveBeenCalledWith({
            title: jasmine.any(String),
            content: "AUTH.GUEST_DATA_TRANSFER_DIALOG.CONTENT.AVERAGES",
            accept: jasmine.any(String),
            cancel: jasmine.any(String)
         });
      });

      it("should open dialog with correct content if there is saved guest data on the timetable page", () => {
         timetableFetcherService.getGuestStorageData.and.returnValue([{} as Semester]);
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(generalDialog.openDialog).toHaveBeenCalledWith({
            title: jasmine.any(String),
            content: "AUTH.GUEST_DATA_TRANSFER_DIALOG.CONTENT.TIMETABLE",
            accept: jasmine.any(String),
            cancel: jasmine.any(String)
         });
      });

      it("should open dialog with correct content if there is saved guest data on the averages page and the timetable page", () => {
         completionsFetcherService.getGuestStorageData.and.returnValue([{} as UniversityCompletionYear]);
         timetableFetcherService.getGuestStorageData.and.returnValue([{} as Semester]);
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(generalDialog.openDialog).toHaveBeenCalledWith({
            title: jasmine.any(String),
            content: "AUTH.GUEST_DATA_TRANSFER_DIALOG.CONTENT.BOTH",
            accept: jasmine.any(String),
            cancel: jasmine.any(String)
         });
      });

      it("should clear guest data and save it for the newly created user if the user accepts the dialog", () => {
         completionsFetcherService.getGuestStorageData.and.returnValue([completion]);
         timetableFetcherService.getGuestStorageData.and.returnValue([semester]);
         generalDialog.openDialog.and.returnValue(of(true));
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(completionsFetcherService.saveCompletions).toHaveBeenCalledWith([completion]);
         expect(timetableFetcherService.saveSemesters).toHaveBeenCalledWith([semester]);
         expect(completionsFetcherService.clearGuestStorage).toHaveBeenCalled();
         expect(timetableFetcherService.clearGuestStorage).toHaveBeenCalled();
      });

      it(`should dispatch ${ userActions.clearUserData.type } action if the user rejects the dialog, without clearing guest data and saving it for the newly created user`, () => {
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         
         expect(effects.register$).toBeObservable(cold('b', { b: userActions.clearUserData() }));
         
         expect(completionsFetcherService.saveCompletions).not.toHaveBeenCalled();
         expect(timetableFetcherService.saveSemesters).not.toHaveBeenCalled();
         expect(completionsFetcherService.clearGuestStorage).not.toHaveBeenCalled();
         expect(timetableFetcherService.clearGuestStorage).not.toHaveBeenCalled();
      });

      it("should open an error snackbar if the registration fails", () => {
         authService.registerUser.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         expect(effects.register$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.AUTH.REGISTER");
      });

      it("should open an error snackbar if the new user data saving fails", () => {
         userFetcherService.saveNewUserData.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         expect(effects.register$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.USER_SAVE");
      });

      it("should open an error snackbar if the completions saving fails", () => {
         completionsFetcherService.getGuestStorageData.and.returnValue([completion]);
         timetableFetcherService.getGuestStorageData.and.returnValue([semester]);
         generalDialog.openDialog.and.returnValue(of(true));
         completionsFetcherService.saveCompletions.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         expect(effects.register$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.GUEST_DATA_TRANSFER");
      });

      it("should open an error snackbar if the timetable saving fails", () => {
         completionsFetcherService.getGuestStorageData.and.returnValue([completion]);
         timetableFetcherService.getGuestStorageData.and.returnValue([semester]);
         generalDialog.openDialog.and.returnValue(of(true));
         timetableFetcherService.saveSemesters.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.register({ registerData }) });

         expect(effects.register$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.GUEST_DATA_TRANSFER");
      });
   });

   describe('updateUserProfile$', () => {
      it("should update user data", () => {
         actions$ = cold('a', { a: userActions.updateUserProfile({ user }) });

         effects.updateUserProfile$.subscribe();
         getTestScheduler().flush();

         expect(userFetcherService.updateUserData).toHaveBeenCalledWith(user);
      });

      it("should notify the user with a snackbar message about the successful update", () => {
         actions$ = cold('a', { a: userActions.updateUserProfile({ user }) });

         effects.updateUserProfile$.subscribe();
         getTestScheduler().flush();

         expect(snackbarService.open).toHaveBeenCalledOnceWith("PROFILE.SETTINGS.SAVE_SUCCESS_MESSAGE");
      });

      it("should open an error snackbar if the user data update fails", () => {
         userFetcherService.updateUserData.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.updateUserProfile({ user }) });

         expect(effects.updateUserProfile$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith("ERROR.DATABASE.USER_UPDATE");
      });
   });

   describe('updateUserSetting', () => {
      it("should dispatch nothing if the user is not logged in", () => {
         actions$ = cold('a', { a: userActions.updateUserSetting({ key: 'testKey' as any, value: 'testValue' }) });

         expect(effects.updateUserSetting$).toBeObservable(cold(''));
      });

      it("should dispatch nothing if the setting value is the same as the current one", () => {
         user$.next({ settings: { testKey: 'testValue' } } as any);
         actions$ = cold('a', { a: userActions.updateUserSetting({ key: 'testKey' as any, value: 'testValue' }) });

         expect(effects.updateUserSetting$).toBeObservable(cold(''));
      });

      it(`should dispatch ${ userActions.updateUserSetting.type } action if the setting value is different from the current one`, () => {
         user$.next({ settings: { testKey: 'testValue' } } as any);
         actions$ = cold('a', { a: userActions.updateUserSetting({ key: 'testKey' as any, value: 'newTestValue' }) });

         const expected = cold('b', { b: userActions.updateUserProfile({ user: { settings: { testKey: 'newTestValue' } } as any }) });

         expect(effects.updateUserSetting$).toBeObservable(expected);
      });
   });

   describe('logout$', () => {
      it("should sign out the user", () => {
         actions$ = cold('a', { a: userActions.logout() });

         effects.logout$.subscribe();
         getTestScheduler().flush();

         expect(authService.signOutUser).toHaveBeenCalled();
      });

      it(`should dispatch ${ userActions.clearUserData.type } action after successful logout`, () => {
         actions$ = cold('a', { a: userActions.logout() });

         const expected = cold('b', { b: userActions.clearUserData() });

         expect(effects.logout$).toBeObservable(expected);
      });

      it("should open an error snackbar if the logout fails", () => {
         authService.signOutUser.and.returnValue(cold('#'));
         actions$ = cold('a', { a: userActions.logout() });

         expect(effects.logout$).toBeObservable(cold(''));
         expect(snackbarService.openError).toHaveBeenCalledOnceWith(jasmine.any(String));
      });
   });
});
