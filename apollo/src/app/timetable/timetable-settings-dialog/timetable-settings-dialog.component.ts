import { ChangeDetectionStrategy, Component, Inject, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { leadingZeros, numberize } from '@apollo/shared/functions';
import { GeneralDialogService } from '@apollo/shared/general-dialog';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { SnackBarService } from '@apollo/shared/services';
import { TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { ColorPickerModule, ColorPickerService } from 'ngx-color-picker';
import { Semester } from '../models';
import { TimetableState } from '../store';
import { EndTimePipe } from './pipes';
import { TimetableSettingsFormsUtils } from './timetable-settings-forms.utils';

@Component({
   selector: 'apo-timetable-settings-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatSelectModule,
      MatTabsModule,
      MatInputModule,
      FormsModule,
      ReactiveFormsModule,
      ColorPickerModule,
      MatCheckboxModule,
      EndTimePipe
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
   public readonly DAYS = Array.from({ length: 7 }, (_, i) => i + 1);

   public readonly data: TimetableState;
   public readonly selectedSemesterId: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;
   private newSemesters = 0;

   public readonly semesterForm: Signal<FormGroup>;
   public readonly categoryForm: Signal<FormGroup>;
   public readonly activityForm: Signal<FormGroup>;
   private readonly formUpdater: WritableSignal<boolean>; // TODO: use explicit FormArray updating instead

   constructor(
      private readonly dialogRef: MatDialogRef<TimetableSettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: TimetableState,
      private readonly fb: FormBuilder,
      private readonly dialog: GeneralDialogService,
      private readonly transloco: TranslocoService,
      private readonly snackbarService: SnackBarService
   ) {
      this.data = cloneDeep(data);
      this.selectedSemesterId = signal(data.selectedSemesterId);
      this.selectedSemester = computed(() => this.data.semesters!.find(semester => semester.id === this.selectedSemesterId()));

      this.formUpdater = signal(true);
      this.semesterForm = computed(() => (this.formUpdater(), TimetableSettingsFormsUtils.buildSemesterForm(this.fb, this.selectedSemester()!)));
      this.categoryForm = computed(() => (this.formUpdater(), TimetableSettingsFormsUtils.buildCategoryFormArray(this.fb, this.selectedSemester()!.categories)));
      this.activityForm = computed(() => (this.formUpdater(), TimetableSettingsFormsUtils.buildActivityFormArray(this.fb, this.selectedSemester()!.activities)));
      
      if(!this.data.semesters!.length) {
         this.addSemester();
      }
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
      const id = Date.now() + "-" + this.newSemesters++;
      this.data.semesters!.push({
         id,
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_SEMESTER_DEFAULT_NAME"),
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
            this.data.semesters = this.data.semesters!.filter(semester => semester.id !== this.selectedSemesterId());
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
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_CATEGORY_DEFAULT_NAME"),
         color: "#FFFFFF",
         temporary: false
      });
      this.updateForms();
   }

   public deleteActivity(index: number): void { // TODO: fix non-instant FormGroup deletion bug
      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.ACTIVITY_DELETE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.ACTIVITY_DELETE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doDelete => {
         if (doDelete) {
            (this.activityForm().controls["activities"] as FormArray).removeAt(index);
            this.activityForm().controls["activities"].markAsDirty();
            this.updateData();
         }
      });
   }

   public duplicateActivity(index: number): void {
      const activity = this.activityForm().value.activities[index];
      (this.activityForm().controls["activities"] as FormArray).insert(index + 1, TimetableSettingsFormsUtils.buildActivityForm(this.fb, activity));
      this.updateData();
   }

   public addActivity(): void {
      (this.activityForm().controls["activities"] as FormArray).push(TimetableSettingsFormsUtils.buildActivityForm(this.fb, {
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_ACTIVITY_DEFAULT_NAME"),
         time: {
            day: 0,
            startingHour: 0,
            startingMinute: 0,
            length: 0
         }
      }));
   }

   public save(): void {
      if(!this.semesterForm().valid || !this.categoryForm().valid || !this.activityForm().valid) {
         this.snackbarService.open("TIMETABLE.SETTINGS_DIALOG.SAVE_ERROR_SNACKBAR", { duration: 5000 });
         return;
      }

      this.updateData();
      this.dialogRef.close(this.data);
   }

   public minuteLeadingZeros(minute: number): string {
      return leadingZeros(minute, 2);
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

      this.selectedSemester()!.activities = this.activityForm().value.activities.map((activity: any) => ({
         ...activity,
         time: numberize(activity.time)
      }));
   }

   private updateForms(): void {
      this.formUpdater.set(!this.formUpdater());
   }
}
