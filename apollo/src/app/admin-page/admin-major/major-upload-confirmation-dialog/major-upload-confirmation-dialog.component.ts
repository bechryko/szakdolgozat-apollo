import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { UniversityMajorSubjectGroup, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { GetSubjectsPipe } from '../../pipes';

interface MajorUploadConfirmationDialogComponentData {
   majorGroups: UniversityMajorSubjectGroup[];
   subjects: UniversitySubject[];
}

@Component({
   selector: 'apo-major-upload-confirmation-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatExpansionModule,
      GetSubjectsPipe
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
