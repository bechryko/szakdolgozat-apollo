import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { GeneralDialogConfig } from './general-dialog-config';
import { GeneralDialogComponent } from './general-dialog/general-dialog.component';

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
}
