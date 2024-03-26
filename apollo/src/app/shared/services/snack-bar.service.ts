import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HashMap, TranslocoService } from '@ngneat/transloco';

interface ApolloSnackBarConfig {
   action?: string;
   duration?: number;
}

@Injectable({
   providedIn: 'root'
})
export class SnackBarService {
   private readonly DEFAULT_TIME = 3000;
   private readonly DEFAULT_ERROR_TIME = 4000;

   constructor(
      private readonly snackbar: MatSnackBar,
      private readonly transloco: TranslocoService
   ) { }

   public open(messageKey: string, config: ApolloSnackBarConfig = {}, messageParams?: HashMap): void {
      this.snackbar.open(this.transloco.translate(messageKey, messageParams), config.action, {
         duration: config.duration ?? this.DEFAULT_TIME
      });
   }

   public openError(errorKey: string, config: ApolloSnackBarConfig = {}, errorParams?: HashMap): void {
      const errorKeyPrefix = errorKey.substring(0, errorKey.lastIndexOf('.'));
      const errorMessage = 
         this.transloco.translate(errorKeyPrefix + ".PREFIX") + 
         ": " + 
         this.transloco.translate(errorKey, errorParams);
      
      this.snackbar.open(errorMessage, config.action, {
         duration: config.duration ?? this.DEFAULT_ERROR_TIME
      });
   }
}
