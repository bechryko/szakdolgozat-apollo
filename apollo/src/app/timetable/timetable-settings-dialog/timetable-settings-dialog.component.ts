import { ChangeDetectionStrategy, Component, Inject, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { leadingZeros } from '@apollo/shared/functions';
import { GeneralDialogService } from '@apollo/shared/general-dialog';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { SnackBarService } from '@apollo/shared/services';
import { TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { ColorPickerModule, ColorPickerService } from 'ngx-color-picker';
import { Activity, ActivityCategory, Semester } from '../models';
import { TimetableState } from '../store';
import { EndTimePipe } from './pipes';

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

   public readonly data: WritableSignal<TimetableState>;
   public readonly selectedSemesterId: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;
   private newSemesters = 0;

   constructor(
      private readonly dialogRef: MatDialogRef<TimetableSettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data: TimetableState,
      private readonly dialog: GeneralDialogService,
      private readonly transloco: TranslocoService,
      private readonly snackbarService: SnackBarService
   ) {
      this.data = signal(cloneDeep(data));
      this.selectedSemesterId = signal(data.selectedSemesterId);
      this.selectedSemester = computed(() => this.data().semesters!.find(semester => semester.id === this.selectedSemesterId()));

      if(!this.data().semesters!.length) {
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
      const newSemester: Semester = {
         id,
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_SEMESTER_DEFAULT_NAME"),
         owner: "",
         activities: [],
         categories: []
      };
      this.data.set({
         ...this.data(),
         semesters: [...this.data().semesters!, newSemester]
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
            this.data.set({
               ...this.data(),
               semesters: this.data().semesters!.filter(semester => semester.id !== this.selectedSemesterId())
            });
            this.selectedSemesterId.set(undefined);
         }
      });
   }

   public categoryNameChanged(index: number, event: any): void {
      const newName = event.target.value;
      const oldName = this.selectedSemester()!.categories[index].name;
      
      const newSemester = cloneDeep(this.selectedSemester()!);
      newSemester.activities.filter(activity => activity.categoryName === oldName).forEach(activity => {
         activity.categoryName = newName;
      });

      newSemester.categories[index].name = newName;

      this.updateSelectedSemester(newSemester);
   }

   public checkStateChanged(index: number, property: keyof ActivityCategory): void {
      const newSemester = cloneDeep(this.selectedSemester()!);
      (newSemester.categories[index][property] as any) = !newSemester.categories[index][property];
      this.updateSelectedSemester(newSemester);
   }

   public deleteCategory(index: number): void {
      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.CATEGORY_DELETE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.CATEGORY_DELETE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doDelete => {
         if (doDelete) {
            const updatedSemester = cloneDeep(this.selectedSemester()!);
            updatedSemester.categories.splice(index, 1);

            const deletedCategory = this.selectedSemester()!.categories[index];
            updatedSemester.activities.filter(activity => activity.categoryName === deletedCategory.name).forEach(activity => {
               delete activity.categoryName;
            });
            
            this.updateSelectedSemester(updatedSemester);
         }
      });
   }

   public addCategory(): void {
      const newCategory: ActivityCategory = {
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_CATEGORY_DEFAULT_NAME"),
         color: "#FFFFFF",
         temporary: false
      };
      
      const updatedSemester = cloneDeep(this.selectedSemester()!);
      updatedSemester.categories.push(newCategory);
      this.updateSelectedSemester(updatedSemester);
   }

   public deleteActivity(index: number): void {
      this.dialog.openDialog({
         title: "TIMETABLE.SETTINGS_DIALOG.ACTIVITY_DELETE_ALERT_DIALOG.TITLE",
         content: "TIMETABLE.SETTINGS_DIALOG.ACTIVITY_DELETE_ALERT_DIALOG.CONTENT",
         accept: "GENERAL_DIALOG.ACCEPT",
         cancel: "GENERAL_DIALOG.CANCEL"
      }).subscribe(doDelete => {
         if (doDelete) {
            const updatedSemester = cloneDeep(this.selectedSemester()!);
            updatedSemester.activities.splice(index, 1);
            this.updateSelectedSemester(updatedSemester);
         }
      });
   }

   public duplicateActivity(index: number): void {
      const updatedSemester = cloneDeep(this.selectedSemester()!);
      updatedSemester.activities.splice(index + 1, 0, cloneDeep(updatedSemester.activities[index]));
      this.updateSelectedSemester(updatedSemester);
   }

   public addActivity(): void {
      const newActivity: Activity = {
         name: this.transloco.translate("TIMETABLE.SETTINGS_DIALOG.NEW_ACTIVITY_DEFAULT_NAME"),
         time: {
            day: 1,
            startingHour: 8,
            startingMinute: 0,
            length: 45
         }
      };

      const updatedSemester = cloneDeep(this.selectedSemester()!);
      updatedSemester.activities.push(newActivity);
      this.updateSelectedSemester(updatedSemester);
   }

   public save(): void {
      const activityWithInvalidTimes = this.checkActivityTimes(this.data().semesters!);
      if(activityWithInvalidTimes) {
         console.log(activityWithInvalidTimes);
         this.snackbarService.open("TIMETABLE.SETTINGS_DIALOG.SAVE_ERROR_SNACKBAR", { duration: 5000 });
         return;
      }

      this.dialogRef.close({
         ...this.data(),
         selectedSemesterId: this.selectedSemesterId()
      });
   }

   public minuteLeadingZeros(minute: number): string {
      return leadingZeros(minute, 2);
   }

   private updateSelectedSemester(semester: Semester): void {
      const oldData = this.data();
      this.data.set({
         ...oldData,
         semesters: oldData.semesters!.map(oldSemester => oldSemester.id === semester.id ? semester : oldSemester)
      });
   }

   private checkActivityTimes(semesters: Semester[]): null | Activity {
      for(const semester of semesters) {
         for(const activity of semester.activities) {
            const activityEndTime = activity.time.startingHour * 60 + activity.time.startingMinute + activity.time.length;
            if(activityEndTime > 24 * 60) {
               return activity;
            }
            if(activity.time.startingHour === 24 || activity.time.startingHour < 0) {
               return activity;
            }
            if(activity.time.startingMinute < 0 || activity.time.startingMinute >= 60) {
               return activity;
            }
            if(activity.time.length <= 45) { // TODO: fix length bug
               return activity;
            }
         }
      }
      return null;
   }
}
