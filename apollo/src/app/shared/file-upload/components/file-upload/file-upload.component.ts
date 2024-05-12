import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '@apollo/shared/services';
import { ParserFunctionsWrapper } from '../../models';
import { FileReadUtils } from '../../utils';
import { FileUploadDataConfirmationDialogComponent } from '../file-upload-data-confirmation-dialog/file-upload-data-confirmation-dialog.component';

function transformAcceptedExtensions(extensions: string | string[]): string {
   if(Array.isArray(extensions)) {
      return extensions.join(',');
   }
   return extensions;
}

@Component({
   selector: 'apo-file-upload',
   standalone: true,
   imports: [],
   templateUrl: './file-upload.component.html',
   styleUrl: './file-upload.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent<T> {
   @Input({ required: true }) public parsers!: ParserFunctionsWrapper<T>;
   @Input({ transform: transformAcceptedExtensions }) public accept = '.txt,.xlsx';
   @Input() public resetOnUpload = true;
   @Input() public confirmationRequired = true;
   @Input() public confirmationDialogTableHeaderKeys?: string[];

   @Output() fileDataChange: EventEmitter<T> = new EventEmitter<T>();

   constructor(
      private readonly dialog: MatDialog,
      private readonly snackBarService: SnackBarService
   ) { }

   public fileUpload(event: Event): void {
      const inputElement = event.target as HTMLInputElement;
      const file = inputElement.files![0];
      
      FileReadUtils.readFile(file, this.parsers).then(data => {
         this.onFileUploadSuccess(data);
      }).catch((errorKey: string) => {
         this.snackBarService.openError(errorKey, { duration: 4500 });
      }).finally(() => {
         if (this.resetOnUpload) {
            inputElement.value = '';
         }
      });
   }

   private onFileUploadSuccess(data: T): void {
      if(Array.isArray(data) && !data.length) {
         this.snackBarService.open("FILE_UPLOAD.NO_NEW_DATA", { duration: 4000 });
         return;
      }

      if(Array.isArray(data) && this.confirmationRequired) {
         this.dialog.open(FileUploadDataConfirmationDialogComponent, {
            data: {
               data,
               columnNameKeys: this.confirmationDialogTableHeaderKeys
            }
         }).afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
               this.fileDataChange.emit(data);
            }
         });
      } else {
         this.fileDataChange.emit(data);
      }
   }
}
