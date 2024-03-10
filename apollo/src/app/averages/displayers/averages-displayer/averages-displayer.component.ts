import { ChangeDetectionStrategy, Component, Input, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { Grade } from '../../models';
import { AverageCalculatorUtils } from '../../utils';

@Component({
   selector: 'apo-averages-displayer',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatButtonModule
   ],
   templateUrl: './averages-displayer.component.html',
   styleUrl: './averages-displayer.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AveragesDisplayerComponent {
   @Input() public title: string = "";
   @Input() set gradeData(value: Grade[]) {
      this.grades.set(value);
   }
   private readonly grades: WritableSignal<Grade[]>;
   public readonly weightedAverage: Signal<number>;
   public readonly creditSum: Signal<number>;
   public readonly creditIndex: Signal<number>;
   public readonly adjustedCreditIndex: Signal<number>;

   constructor() {
      this.grades = signal([]);
      this.weightedAverage = computed(() => AverageCalculatorUtils.calculateWeightedAverage(this.grades()));
      this.creditSum = computed(() => AverageCalculatorUtils.sumCredits(this.grades()));
      this.creditIndex = computed(() => AverageCalculatorUtils.calculateCreditIndex(this.grades()));
      this.adjustedCreditIndex = computed(() => AverageCalculatorUtils.calculateAdjustedCreditIndex(this.grades()));
   }

   public calculateScholarship(): void {
      // TODO: open dialog
   }
}
