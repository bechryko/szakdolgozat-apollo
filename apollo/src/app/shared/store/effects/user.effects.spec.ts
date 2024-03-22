import { TestBed } from "@angular/core/testing";
import { GeneralDialogService } from "@apollo/shared/general-dialog";
import { ApolloUser, UniversityCompletionYear } from "@apollo/shared/models";
import { CompletionsFetcherService, SnackBarService } from "@apollo/shared/services";
import { Semester } from "@apollo/timetable/models";
import { TimetableFetcherService } from "@apollo/timetable/services/timetable-fetcher.service";
import { LoginData, RegisterData } from "@apollo/user/models";
import { AuthService, UserFetcherService } from "@apollo/user/services";
import { provideMockActions } from "@ngrx/effects/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { TestColdObservable } from "jasmine-marbles/src/test-observables";
import { of } from "rxjs";
import { userActions } from "../actions";
import { UserEffects } from "./user.effects";

describe('UserEffects', () => {
   let effects: UserEffects;
   let actions$: TestColdObservable;
   let authService: jasmine.SpyObj<AuthService>;
   let userFetcherService: jasmine.SpyObj<UserFetcherService>;
   let snackbar: jasmine.SpyObj<SnackBarService>;
   let generalDialog: jasmine.SpyObj<GeneralDialogService>;
   let completionsFetcherService: jasmine.SpyObj<CompletionsFetcherService>;
   let timetableFetcherService: jasmine.SpyObj<TimetableFetcherService>;

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

   beforeEach(() => {
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
               useValue: jasmine.createSpyObj('SnackBarService', ['open'])
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
            }
         ]
      });

      effects = TestBed.inject(UserEffects);
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      userFetcherService = TestBed.inject(UserFetcherService) as jasmine.SpyObj<UserFetcherService>;
      snackbar = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
      generalDialog = TestBed.inject(GeneralDialogService) as jasmine.SpyObj<GeneralDialogService>;
      completionsFetcherService = TestBed.inject(CompletionsFetcherService) as jasmine.SpyObj<CompletionsFetcherService>;
      timetableFetcherService = TestBed.inject(TimetableFetcherService) as jasmine.SpyObj<TimetableFetcherService>;
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
   });

   describe('register$', () => {
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
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         completionsFetcherService.getGuestStorageData.and.returnValue([{} as UniversityCompletionYear]);

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
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         timetableFetcherService.getGuestStorageData.and.returnValue([{} as Semester]);

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
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         completionsFetcherService.getGuestStorageData.and.returnValue([{} as UniversityCompletionYear]);
         timetableFetcherService.getGuestStorageData.and.returnValue([{} as Semester]);

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
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         const completion = {
            id: 'testId',
            name: 'testYearName',
            owner: 'testOwner'
         } as UniversityCompletionYear;
         completionsFetcherService.getGuestStorageData.and.returnValue([completion]);
         const semester = {
            id: 'testId',
            name: 'testSemesterName',
            owner: 'testOwner'
         } as Semester;
         timetableFetcherService.getGuestStorageData.and.returnValue([semester]);
         generalDialog.openDialog.and.returnValue(of(true));

         effects.register$.subscribe();
         getTestScheduler().flush();

         expect(completionsFetcherService.saveCompletions).toHaveBeenCalledWith([completion]);
         expect(timetableFetcherService.saveSemesters).toHaveBeenCalledWith([semester]);
         expect(completionsFetcherService.clearGuestStorage).toHaveBeenCalled();
         expect(timetableFetcherService.clearGuestStorage).toHaveBeenCalled();
      });

      it(`should dispatch ${ userActions.clearUserData.type } action if the user rejects the dialog, without clearing guest data and saving it for the newly created user`, () => {
         actions$ = cold('a', { a: userActions.register({ registerData }) });
         generalDialog.openDialog.and.returnValue(of(false));
   
         expect(effects.register$).toBeObservable(cold('b', { b: userActions.clearUserData() }));
         
         expect(completionsFetcherService.saveCompletions).not.toHaveBeenCalled();
         expect(timetableFetcherService.saveSemesters).not.toHaveBeenCalled();
         expect(completionsFetcherService.clearGuestStorage).not.toHaveBeenCalled();
         expect(timetableFetcherService.clearGuestStorage).not.toHaveBeenCalled();
      });
   });

   describe('updateUserProfile$', () => {
      it("should update user data", () => {
         actions$ = cold('a', { a: userActions.updateUserProfile({ user }) });

         effects.updateUserProfile$.subscribe();
         getTestScheduler().flush();

         expect(userFetcherService.updateUserData).toHaveBeenCalledWith(user);
      });

      it("should notify the user with a snackbar message", () => {
         actions$ = cold('a', { a: userActions.updateUserProfile({ user }) });

         effects.updateUserProfile$.subscribe();
         getTestScheduler().flush();

         expect(snackbar.open).toHaveBeenCalled();
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
   });
});
