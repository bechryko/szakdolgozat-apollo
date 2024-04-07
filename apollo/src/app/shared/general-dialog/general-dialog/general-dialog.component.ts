import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { GeneralDialogConfig } from '../general-dialog-config';

@Component({
   selector: 'apo-general-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule
   ],
   templateUrl: './general-dialog.component.html',
   styleUrl: './general-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralDialogComponent {
   constructor(
      private readonly dialogRef: MatDialogRef<GeneralDialogComponent, boolean>,
      @Inject(MAT_DIALOG_DATA) public readonly data: GeneralDialogConfig
   ) {
      data.accept ??= "GENERAL_DIALOG.ACCEPT";
      data.cancel ??= "GENERAL_DIALOG.CANCEL";
   }

   public close(result: boolean): void {
      this.dialogRef.close(result);
   }
}
