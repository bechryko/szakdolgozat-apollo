import { ChangeDetectionStrategy, Component, Input, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { Grade } from '../../models';
import { AverageCalculatorUtils } from '../../utils';
import { AveragesDisplayerComponent } from '../averages-displayer';

@Component({
   selector: 'apo-multi-averages-displayer',
   standalone: true,
   imports: [
      TranslocoPipe,
      AveragesDisplayerComponent,
      MatButtonModule
   ],
   templateUrl: './multi-averages-displayer.component.html',
   styleUrl: './multi-averages-displayer.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiAveragesDisplayerComponent { // TODO: add diagrams
   @Input() public title: string = "";
   @Input() public yearDisplay: boolean = false;
   @Input() set gradeData(value: Grade[][]) {
      this.grades.set(value);
   }
   public readonly grades: WritableSignal<Grade[][]>;
   public readonly weightedAverage: Signal<number>;
   public readonly creditSum: Signal<number>;
   public readonly creditIndex: Signal<number>;
   public readonly adjustedCreditIndex: Signal<number>;

   constructor() {
      this.grades = signal([]);
      this.weightedAverage = computed(() => AverageCalculatorUtils.calculateWeightedAverage(this.grades().flat()));
      this.creditSum = computed(() => AverageCalculatorUtils.sumCredits(this.grades().flat()));
      this.creditIndex = computed(() => AverageCalculatorUtils.calculateAverage(...this.grades().map(semester => AverageCalculatorUtils.calculateCreditIndex(semester)))); // TODO: is it the correct calculation method?
      this.adjustedCreditIndex = computed(() => AverageCalculatorUtils.calculateAverage(...this.grades().map(semester => AverageCalculatorUtils.calculateAdjustedCreditIndex(semester))));
   }

   public setAlternatives(): void {
      // TODO: open dialog
   }
}
