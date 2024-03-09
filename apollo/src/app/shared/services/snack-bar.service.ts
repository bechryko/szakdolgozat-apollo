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
   constructor(
      private readonly snackbar: MatSnackBar,
      private readonly translateService: TranslocoService
   ) { }

   public open(messageKey: string, config: ApolloSnackBarConfig, messageParams?: HashMap): void {
      this.snackbar.open(this.translateService.translate(messageKey, messageParams), config.action, {
         duration: config.duration ?? 3000
      });
   }
}
