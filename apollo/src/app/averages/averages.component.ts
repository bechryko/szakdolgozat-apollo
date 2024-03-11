import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@ngneat/transloco';
import { tap } from 'rxjs';
import { AveragesDisplayerComponent, MultiAveragesDisplayerComponent } from './displayers';
import { Grade, GradesCompletionYear } from './models';
import { AveragesService } from './services';

@Component({
   selector: 'apo-averages',
   standalone: true,
   imports: [
      CommonModule,
      AveragesDisplayerComponent,
      MultiAveragesDisplayerComponent,
      MatFormFieldModule,
      MatSelectModule,
      FormsModule,
      TranslocoPipe,
      MatButtonModule
   ],
   templateUrl: './averages.component.html',
   styleUrl: './averages.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AveragesComponent {
   public readonly averages: Signal<GradesCompletionYear[] | undefined>;
   public readonly allGrades: Signal<Grade[][] | undefined>;
   public readonly selectedYear: WritableSignal<GradesCompletionYear | undefined>;
   public readonly singleYearViewMode: WritableSignal<boolean>;
   
   constructor(
      private readonly averagesService: AveragesService
   ) {
      this.averages = toSignal(this.averagesService.grades$.pipe(
         tap(grades => this.selectedYear.set(this.getStartingSelectedYear(grades)))
      ));
      this.allGrades = computed(() => {
         const averages = this.averages();
         if(!averages) {
            return;
         }

         return averages.map(average => [average.firstSemesterGrades, average.secondSemesterGrades]).flat();
      });
      this.selectedYear = signal(undefined);
      this.singleYearViewMode = signal(false);
   }

   public toggleViewMode(): void {
      this.singleYearViewMode.set(!this.singleYearViewMode());
   }

   public selectYear(year: GradesCompletionYear): void {
      this.selectedYear.set(year);
   }

   public manageGrades(): void {
      // TODO: settings dialog
   }

   private getStartingSelectedYear(averages?: GradesCompletionYear[]): GradesCompletionYear | undefined {
      if(!averages?.length) {
         return;
      }

      return averages[averages.length - 1];
   }
}
