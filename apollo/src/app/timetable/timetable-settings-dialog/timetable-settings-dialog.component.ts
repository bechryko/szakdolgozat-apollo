import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { ColorPickerModule, ColorPickerService } from 'ngx-color-picker';
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
      ReactiveFormsModule,
      ColorPickerModule,
      MatCheckboxModule
   ],
   providers: [
      ColorPickerService
   ],
   templateUrl: './timetable-settings-dialog.component.html',
   styleUrl: './timetable-settings-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableSettingsDialogComponent {
   public readonly PRESET_CATEGORY_COLORS = [];

   public readonly data: TimetableState;
   public readonly selectedSemesterId: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;
   private newSemesters = 0;

   public readonly semesterForm: Signal<FormGroup>;
   public readonly categoryForm: Signal<FormGroup>;
   private readonly formUpdater: WritableSignal<boolean>;

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

      this.formUpdater = signal(true);
      this.semesterForm = computed(() => (this.formUpdater(), TimetableSettingsFormsUtils.buildSemesterForm(this.fb, this.selectedSemester()!)));
      this.categoryForm = computed(() => (this.formUpdater(), TimetableSettingsFormsUtils.buildCategoryFormArray(this.fb, this.selectedSemester()!.categories)));
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
      const id = `new-${this.newSemesters++}`;
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

   public categoryNameChanged(index: number): void {
      const newName = this.categoryForm().value.categories[index].name;
      const oldName = this.selectedSemester()!.categories[index].name;
      
      this.updateData();

      this.selectedSemester()!.activities.filter(activity => activity.categoryName === oldName).forEach(activity => {
         activity.categoryName = newName;
      });
      this.updateForms();
   }

   public deleteCategory(index: number): void {
      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.CATEGORY_DELETE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.CATEGORY_DELETE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doDelete => {
         if (doDelete) {
            this.updateData();
            const deletedCategory = this.selectedSemester()!.categories.splice(index, 1)[0];
            this.updateForms();

            this.selectedSemester()!.activities.filter(activity => activity.categoryName === deletedCategory.name).forEach(activity => {
               delete activity.categoryName;
            });
         }
      });
   }

   public addCategory(): void {
      this.updateData();
      this.selectedSemester()!.categories.push({
         name: this.translateService.translate("TIMETABLE.SETTINGS_DIALOG.NEW_CATEGORY_DEFAULT_NAME"),
         color: "#FFFFFF",
         temporary: false
      });
      this.updateForms();
   }

   public save(): void {
      this.updateData();
      this.dialogRef.close(this.data);
   }

   private updateData(): void {
      if (!this.selectedSemester()) {
         this.selectedSemesterId.set(undefined);
         return;
      }

      this.data.selectedSemesterId = this.selectedSemesterId();
      this.selectedSemester()!.name = this.semesterForm().value.name;

      this.selectedSemester()!.categories.forEach((category, index) => {
         const formCategory = this.categoryForm().value.categories[index];
         category.name = formCategory.name;
         category.temporary = formCategory.temporary;
      });
   }

   private updateForms(): void {
      this.formUpdater.set(!this.formUpdater());
   }
}
