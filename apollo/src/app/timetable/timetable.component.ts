import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Signal, ViewChild, WritableSignal, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { Observable, fromEvent, map, startWith } from 'rxjs';
import { ActivityStylePipe } from './activity/activity-style.pipe';
import { ActivityComponent } from './activity/activity.component';
import { Interval, Semester, TimetableSizeData } from './models';
import { TimetableService } from './services';
import { TimetableSettingsDialogComponent } from './timetable-settings-dialog';
import { TimetableSettingsDialogData } from './timetable-settings-dialog/timetable-settings-dialog-data';
import { TimetableSplitUtils, TimetableUtils } from './utils';

@Component({
   selector: 'apo-timetable',
   standalone: true,
   imports: [
      CommonModule,
      TranslocoPipe,
      MatButtonModule,
      ActivityComponent,
      ActivityStylePipe
   ],
   templateUrl: './timetable.component.html',
   styleUrl: './timetable.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableComponent implements AfterViewInit {
   private readonly semesters: Signal<Semester[] | undefined>;
   private readonly selectedSemesterName: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;
   public readonly additionalSelectedSemesterData: {
      displayableDays: Signal<Interval>,
      dayHeadersStyle: Signal<Record<string, string>>,
      displayableHours: Signal<Interval>,
      hourHeadersStyle: Signal<Record<string, string>>
   };
   public readonly displayable: {
      days: Signal<number[]>,
      hours: Signal<number[]>
   };
   @ViewChild('timetable') private readonly timetableContainer!: ElementRef<HTMLDivElement>;
   public timetableAreaSize$?: Observable<TimetableSizeData>;

   constructor(
      private readonly timetableService: TimetableService,
      private readonly dialog: MatDialog
   ) {
      this.semesters = toSignal(this.timetableService.semesters$);
      this.selectedSemesterName = signal(undefined);
      this.selectedSemester = computed(() => {
         if (!this.semesters()?.length || !this.selectedSemesterName()) {
            return undefined;
         }
         return this.semesters()!.find(semester => semester.name === this.selectedSemesterName());
      });

      this.additionalSelectedSemesterData = {
         displayableDays: computed(() => TimetableUtils.getDisplayableDays(this.selectedSemester())),
         dayHeadersStyle: computed(() => ({
            "grid-template-columns": `repeat(${this.additionalSelectedSemesterData.displayableDays().count}, 1fr)`
         })),
         displayableHours: computed(() => TimetableUtils.getDisplayableHours(this.selectedSemester())),
         hourHeadersStyle: computed(() => ({
            "grid-template-rows": `repeat(${this.additionalSelectedSemesterData.displayableHours().count}, 1fr)`
         }))
      };

      this.displayable = {
         days: computed(() => Array.from(
            { length: this.additionalSelectedSemesterData.displayableDays().count },
            (_, i) => i + this.additionalSelectedSemesterData.displayableDays().start
         )),
         hours: computed(() => Array.from(
            { length: this.additionalSelectedSemesterData.displayableHours().count },
            (_, i) => i + this.additionalSelectedSemesterData.displayableHours().start
         ))
      };
   }

   public ngAfterViewInit(): void {
      this.timetableAreaSize$ = fromEvent(globalThis, 'resize').pipe(
         startWith(null),
         map(_ => {
            const container = this.timetableContainer.nativeElement;
            return {
               dayWidth: container.offsetWidth / this.additionalSelectedSemesterData.displayableDays().count,
               hourHeight: container.offsetHeight / this.additionalSelectedSemesterData.displayableHours().count,
               startingDay: this.additionalSelectedSemesterData.displayableDays().start,
               startingHour: this.additionalSelectedSemesterData.displayableHours().start
            };
         })
      );
   }

   public openTimetableSettings(): void {
      this.dialog.open<TimetableSettingsDialogComponent, TimetableSettingsDialogData, TimetableSettingsDialogData>(TimetableSettingsDialogComponent, {
         data: {
            semesters: this.semesters(),
            selectedSemester: this.selectedSemester()
         }
      }).afterClosed().subscribe(data => {
         if (!data) {
            return;
         }
         this.selectedSemesterName.set(data.selectedSemester?.name);
         // TODO: dispatch semester update action
      });
   }
}
