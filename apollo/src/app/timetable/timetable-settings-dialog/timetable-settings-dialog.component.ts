import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoPipe } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { TimetableSettingsDialogData } from './timetable-settings-dialog-data';

@Component({
   selector: 'apo-timetable-settings-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatFormFieldModule,
      MatSelectModule,
      MatTabsModule,
      MatInputModule,
      MatButtonModule
   ],
   templateUrl: './timetable-settings-dialog.component.html',
   styleUrl: './timetable-settings-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableSettingsDialogComponent {
   public readonly data: TimetableSettingsDialogData;

   constructor(
      private readonly dialogRef: MatDialogRef<TimetableSettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: TimetableSettingsDialogData,
   ) {
      this.data = cloneDeep(data);
   }

   public save(): void {
      this.dialogRef.close(this.data);
   }
}
