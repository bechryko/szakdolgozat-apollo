import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoPipe } from '@ngneat/transloco';

interface GeneralInputDialogData {
   title: string;
   description?: string;
   inputType: 'text';
   inputLabel: string;
   submitLabel?: string;
}

@Component({
   selector: 'apo-general-input-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      FormsModule
   ],
   templateUrl: './general-input-dialog.component.html',
   styleUrl: './general-input-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralInputDialogComponent<T> {
   public outputValue?: T;

   constructor(
      @Inject(MAT_DIALOG_DATA) public readonly data: GeneralInputDialogData,
      private readonly dialogRef: MatDialogRef<GeneralInputDialogComponent<T>, T>
   ) {
      this.data.submitLabel ??= "GENERAL_DIALOG.ACCEPT";
   }

   public submit(): void {
      this.dialogRef.close(this.outputValue);
   }
}
