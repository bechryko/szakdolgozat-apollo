import { TestBed } from "@angular/core/testing";
import { cold, getTestScheduler } from "jasmine-marbles";
import { switchMap } from "rxjs";
import { LoadingService } from "../loading";
import { SnackBarService } from "../services";
import { catchAndNotifyError, registerCatchAndNotifyErrorOperator } from "./catch-and-notify-error";

describe('catchAndNotifyError', () => {
   let loadingService: jasmine.SpyObj<LoadingService>;
   let snackbarService: jasmine.SpyObj<SnackBarService>;

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            {
               provide: LoadingService,
               useValue: jasmine.createSpyObj('LoadingService', ['finishLoading'])
            },
            {
               provide: SnackBarService,
               useValue: jasmine.createSpyObj('SnackBarService', ['openError'])
            }
         ]
      });

      loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
      snackbarService = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;

      registerCatchAndNotifyErrorOperator(loadingService, snackbarService);
   });

   it("should catch the errors in the stream", () => {
      const stream = cold('--#');

      expect(
         stream.pipe(
            catchAndNotifyError(Symbol('loadingKey'), 'messageKey')
         )
      ).toBeObservable(cold('--|'));
   });

   it("should not interrupt the outer stream if in inner subscription an error is thrown", () => {
      const stream = cold('a--b|');

      expect(
         stream.pipe(
            switchMap(() => cold('c-#').pipe(
               catchAndNotifyError(Symbol('loadingKey'), 'messageKey')
            ))
         )
      ).toBeObservable(cold('c--c-|'));
   });

   it("should finish the loading and open the error message on error thrown", () => {
      const stream = cold('--#');
      const loadingKey = Symbol('loadingKey');
      const messageKey = 'messageKey';

      stream.pipe(
         catchAndNotifyError(loadingKey, messageKey)
      ).subscribe();

      getTestScheduler().flush();

      expect(loadingService.finishLoading).toHaveBeenCalledOnceWith(loadingKey);
      expect(snackbarService.openError).toHaveBeenCalledOnceWith(messageKey);
   });
});