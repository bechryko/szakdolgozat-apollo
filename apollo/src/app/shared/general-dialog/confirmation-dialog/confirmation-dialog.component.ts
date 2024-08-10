import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmationDialogConfig } from '../models';

@Component({
   selector: 'apo-confirmation-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatInputModule,
      ReactiveFormsModule
   ],
   templateUrl: './confirmation-dialog.component.html',
   styleUrl: './confirmation-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
   public readonly confirmationTextControl: FormControl<string | null>;
   public readonly confirmationText: string;

   public invalidConfirmationText = false;

   constructor(
      private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent, boolean>,
      @Inject(MAT_DIALOG_DATA) public readonly config: ConfirmationDialogConfig,
      private readonly transloco: TranslocoService
   ) {
      this.confirmationTextControl = new FormControl();
      this.confirmationText = this.transloco.translate(config.confirmationText);
   }

   public validate(): void {
      if(this.confirmationTextControl.value === this.confirmationText) {
         this.close(true);
      } else {
         this.invalidConfirmationText = true;
      }
   }

   public close(result: boolean): void {
      this.dialogRef.close(result);
   }
}
