import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { GeneralDialogComponent } from './general-dialog/general-dialog.component';
import { ConfirmationDialogConfig, GeneralDialogConfig } from './models';

@Injectable({
   providedIn: 'root'
})
export class GeneralDialogService {
   constructor(
      private readonly dialog: MatDialog
   ) { }

   public openDialog(config: GeneralDialogConfig): Observable<boolean> {
      return this.dialog.open<GeneralDialogComponent, GeneralDialogConfig, boolean>(GeneralDialogComponent, { data: config }).afterClosed().pipe(
         map(result => Boolean(result))
      );
   }

   public openConfirmationDialog(config: ConfirmationDialogConfig): Observable<boolean> {
      return this.dialog.open<ConfirmationDialogComponent, ConfirmationDialogConfig, boolean>(ConfirmationDialogComponent, { data: config }).afterClosed().pipe(
         map(result => Boolean(result))
      );
   }
}
