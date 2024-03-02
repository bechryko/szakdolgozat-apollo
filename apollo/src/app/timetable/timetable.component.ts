import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { Semester } from './models';
import { TimetableService } from './services';
import { TimetableSettingsDialogComponent } from './timetable-settings-dialog';
import { TimetableSettingsDialogData } from './timetable-settings-dialog/timetable-settings-dialog-data';

@Component({
   selector: 'apo-timetable',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatButtonModule
   ],
   templateUrl: './timetable.component.html',
   styleUrl: './timetable.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableComponent {
   private readonly semesters: Signal<Semester[] | undefined>;
   private readonly selectedSemesterName: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;

   constructor(
      private readonly timetableService: TimetableService,
      private readonly dialog: MatDialog
   ) {
      this.semesters = toSignal(this.timetableService.semesters$);
      this.selectedSemesterName = signal(undefined);
      this.selectedSemester = computed(() => {
         if(!this.semesters()?.length || !this.selectedSemesterName()) {
            return undefined;
         }
         return this.semesters()!.find(semester => semester.name === this.selectedSemesterName());
      });

      effect(() => console.log(this.selectedSemester()));
   }

   public openTimetableSettings(): void {
      this.dialog.open<TimetableSettingsDialogComponent, TimetableSettingsDialogData, TimetableSettingsDialogData>(TimetableSettingsDialogComponent, {
         data: {
            semesters: this.semesters(),
            selectedSemester: this.selectedSemester()
         }
      }).afterClosed().subscribe(data => {
         if(!data) {
            return;
         }
         this.selectedSemesterName.set(data.selectedSemester?.name);
         // TODO: dispatch semester update action
      });
   }
}
