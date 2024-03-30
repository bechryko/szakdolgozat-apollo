import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { UniversityMajorSubjectGroup, UniversitySubject } from '@apollo/shared/models';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { GetSubjectsPipe } from '../pipes';

interface MajorUploadConfirmationDialogComponentData {
   majorGroups: UniversityMajorSubjectGroup[];
   subjects: UniversitySubject[];
}

@Component({
   selector: 'apo-major-upload-confirmation-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatExpansionModule,
      MatButtonModule,
      GetSubjectsPipe,
      NgLetModule
   ],
   templateUrl: './major-upload-confirmation-dialog.component.html',
   styleUrl: './major-upload-confirmation-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MajorUploadConfirmationDialogComponent {
   constructor(
      private readonly dialogRef: MatDialogRef<MajorUploadConfirmationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public readonly data: MajorUploadConfirmationDialogComponentData
   ) { }

   public onConfirm(): void {
      this.dialogRef.close(true);
   }
}
