import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Signal, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { Observable, fromEvent, map, startWith } from 'rxjs';
import { ActivityStylePipe } from './activity/activity-style.pipe';
import { ActivityComponent } from './activity/activity.component';
import { Interval, Semester, TimetableSizeData } from './models';
import { TimetableService } from './services';
import { TimetableState } from './store';
import { TimetableSettingsDialogComponent } from './timetable-settings-dialog';
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
export class TimetableComponent implements AfterViewChecked {
   private readonly semesters: Signal<Semester[] | undefined>;
   private readonly selectedSemesterId: Signal<string | undefined>;
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
   public readonly timetableAreaSize$: WritableSignal<Observable<TimetableSizeData> | undefined>;

   constructor(
      private readonly timetableService: TimetableService,
      private readonly dialog: MatDialog
   ) {
      this.semesters = toSignal(this.timetableService.semesters$.pipe(
         map(semesters => semesters?.map(sem => TimetableSplitUtils.splitTimetable(sem)))
      ));
      this.selectedSemesterId = toSignal(this.timetableService.selectedSemesterId$);
      this.selectedSemester = computed(() => {
         if (!this.semesters()?.length || !this.selectedSemesterId()) {
            return undefined;
         }
         return this.semesters()!.find(semester => semester.id === this.selectedSemesterId());
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

      this.timetableAreaSize$ = signal(undefined);
   }

   public ngAfterViewChecked(): void {
      this.timetableAreaSize$.set(this.getTimetableAreaSize());
   }

   private getTimetableAreaSize(): Observable<TimetableSizeData> | undefined {
      if(!this.timetableContainer) {
         return;
      }

      return fromEvent(globalThis, 'resize').pipe(
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
      this.dialog.open<TimetableSettingsDialogComponent, TimetableState, TimetableState>(TimetableSettingsDialogComponent, {
         data: {
            semesters: this.semesters()!,
            selectedSemesterId: this.selectedSemester()?.id
         }
      }).afterClosed().subscribe(data => {
         if (!data) {
            return;
         }
         console.log(data);
         this.timetableAreaSize$.set(undefined);
         this.timetableService.saveTimetableData(data.semesters, data.selectedSemesterId);
      });
   }
}
