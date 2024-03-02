import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Semester } from './models';
import { TimetableService } from './services';

@Component({
   selector: 'apo-timetable',
   standalone: true,
   imports: [],
   templateUrl: './timetable.component.html',
   styleUrl: './timetable.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableComponent {
   private readonly semesters: Signal<Semester[] | undefined>;
   private readonly selectedSemesterName: WritableSignal<string | undefined>;
   public readonly selectedSemester: Signal<Semester | undefined>;

   constructor(
      private readonly timetableService: TimetableService
   ) {
      this.semesters = toSignal(this.timetableService.semesters$);
      this.selectedSemesterName = signal(undefined);
      this.selectedSemester = computed(() => {
         if(!this.semesters()?.length || !this.selectedSemesterName()) {
            return undefined;
         }
         return this.semesters()!.find(semester => semester.name === this.selectedSemesterName());
      });
   }
}
