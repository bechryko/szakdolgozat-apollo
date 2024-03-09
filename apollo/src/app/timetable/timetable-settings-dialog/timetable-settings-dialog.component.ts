import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { GeneralDialogService } from '@apollo-shared/general-dialog';
import { Semester } from '@apollo-timetable/models';
import { TimetableState } from '@apollo-timetable/store';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { TimetableSettingsFormsUtils } from './timetable-settings-forms.utils';

@Component({
   selector: 'apo-timetable-settings-dialog',
   standalone: true,
   imports: [
      CommonModule,
      TranslocoPipe,
      MatFormFieldModule,
      MatSelectModule,
      MatTabsModule,
      MatInputModule,
      MatButtonModule,
      FormsModule,
      ReactiveFormsModule
   ],
   templateUrl: './timetable-settings-dialog.component.html',
   styleUrl: './timetable-settings-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableSettingsDialogComponent {
   public readonly data: TimetableState;
   public readonly selectedSemesterId: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;
   private newSemesters = 0;

   public readonly semesterForm: Signal<FormGroup>;

   constructor(
      private readonly dialogRef: MatDialogRef<TimetableSettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: TimetableState,
      private readonly fb: FormBuilder,
      private readonly dialog: GeneralDialogService,
      private readonly translateService: TranslocoService
   ) {
      this.data = cloneDeep(data);
      this.selectedSemesterId = signal(data.selectedSemesterId);
      this.selectedSemester = computed(() => this.data.semesters.find(semester => semester.id === this.selectedSemesterId()));

      this.semesterForm = computed(() => TimetableSettingsFormsUtils.buildSemesterForm(this.fb, this.selectedSemester()!));
   }

   public selectSemester(semesterId: string): void {
      if(!this.selectedSemester()) {
         this.selectedSemesterId.set(semesterId);
         return;
      }

      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.SEMESTER_CHANGE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.SEMESTER_CHANGE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doSelect => {
         if (doSelect) {
            this.selectedSemesterId.set(semesterId);
         }
      });
   }

   public addSemester(): void {
      const id = `new-${ this.newSemesters++ }`;
      this.data.semesters.push({
         id,
         name: this.translateService.translate("TIMETABLE.SETTINGS_DIALOG.NEW_SEMESTER_DEFAULT_NAME"),
         owner: "",
         activities: [],
         categories: []
      });
      this.selectSemester(id);
   }

   public deleteSemester(): void {
      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.SEMESTER_DELETE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.SEMESTER_DELETE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doDelete => {
         if (doDelete) {
            this.data.semesters = this.data.semesters.filter(semester => semester.id !== this.selectedSemesterId());
            this.selectedSemesterId.set(undefined);
         }
      });
   }

   public save(): void {
      this.updateData();
      this.dialogRef.close(this.data);
   }

   private updateData(): void {
      const selectedSemester = this.data.semesters.find(semester => semester.id === this.selectedSemesterId());
      if (!selectedSemester) {
         this.selectedSemesterId.set(undefined);
         return;
      }

      this.data.selectedSemesterId = this.selectedSemesterId();
      selectedSemester.name = this.semesterForm().value.name;
   }
}
