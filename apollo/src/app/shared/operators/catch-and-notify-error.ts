import { catchError, OperatorFunction } from "rxjs";
import { LoadingService } from "../loading";
import { SnackBarService } from "../services";

let finishLoading: (loadingKey: Symbol) => void;
let openError: (messageKey: string) => void;

export function registerCatchAndNotifyErrorOperator(loadingService: LoadingService, snackbarService: SnackBarService): void {
   finishLoading = (loadingKey) => loadingService.finishLoading(loadingKey);
   openError = (messageKey) => snackbarService.openError(messageKey);
}

export function catchAndNotifyError<T>(loadingKey: Symbol, messageKey: string): OperatorFunction<T, T> {
   return catchError(() => {
      finishLoading(loadingKey);
      openError(messageKey);
      return [];
   });
}
