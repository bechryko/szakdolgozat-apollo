import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { TranslocoPipe } from '@ngneat/transloco';
import { FileUploadDataConfirmationDialogData } from './file-upload-data-confirmation-dialog-data.d';

@Component({
   selector: 'apo-file-upload-data-confirmation-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatTableModule,
      MatButtonModule
   ],
   templateUrl: './file-upload-data-confirmation-dialog.component.html',
   styleUrl: './file-upload-data-confirmation-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadDataConfirmationDialogComponent<T extends {}> {
   public readonly dataKeys: any[];
   public readonly dataTable: unknown[][];

   constructor(
      private readonly dialogRef: MatDialogRef<FileUploadDataConfirmationDialogComponent<T>, boolean>,
      @Inject(MAT_DIALOG_DATA) public readonly data: FileUploadDataConfirmationDialogData<T>
   ) {
      this.dataKeys = Object.keys(data.data[0]) as (keyof T)[];
      this.dataTable = data.data.map(row => this.dataKeys.map((key: keyof T) => row[key]));
   }

   public accept(): void {
      this.dialogRef.close(true);
   }

   public reject(): void {
      this.dialogRef.close(false);
   }
}
