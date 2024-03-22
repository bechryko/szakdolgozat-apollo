import { ChangeDetectionStrategy, Component, Input, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DisplayValuePipe } from '@apollo/shared/pipes';
import { TranslocoPipe } from '@ngneat/transloco';
import { AlternativeGrade, Grade } from '../../models';
import { AverageCalculatorUtils } from '../../utils';

@Component({
   selector: 'apo-averages-displayer',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatButtonModule,
      MatIconModule,
      DisplayValuePipe
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

   @Input() set alternativesData(value: AlternativeGrade[] | undefined) {
      this.alternatives.set(value?.filter(alternative => !alternative.disabled));
   }
   private readonly alternatives: WritableSignal<AlternativeGrade[] | undefined>;
   public readonly alternativeWeightedAverage: Signal<number | null>;
   public readonly alternativeCreditSum: Signal<number | null>;
   public readonly alternativeCreditIndex: Signal<number | null>;
   public readonly alternativeAdjustedCreditIndex: Signal<number | null>;

   constructor() {
      this.grades = signal([]);
      this.weightedAverage = computed(() => AverageCalculatorUtils.calculateWeightedAverage(this.grades()));
      this.creditSum = computed(() => AverageCalculatorUtils.sumCredits(this.grades()));
      this.creditIndex = computed(() => AverageCalculatorUtils.calculateCreditIndex(this.grades()));
      this.adjustedCreditIndex = computed(() => AverageCalculatorUtils.calculateAdjustedCreditIndex(this.grades()));

      this.alternatives = signal([]);
      this.alternativeWeightedAverage = computed(() => {
         const alternatives = this.alternatives();
         if(!alternatives) {
            return null;
         }
         const average = AverageCalculatorUtils.calculateWeightedAverage(alternatives);
         return average === this.weightedAverage() ? null : average;
      });
      this.alternativeCreditSum = computed(() => {
         const alternatives = this.alternatives();
         if(!alternatives) {
            return null;
         }
         const sum = AverageCalculatorUtils.sumCredits(alternatives);
         return sum === this.creditSum() ? null : sum;
      });
      this.alternativeCreditIndex = computed(() => {
         const alternatives = this.alternatives();
         if(!alternatives) {
            return null;
         }
         const index = AverageCalculatorUtils.calculateCreditIndex(alternatives);
         return index === this.creditIndex() ? null : index;
      });
      this.alternativeAdjustedCreditIndex = computed(() => {
         const alternatives = this.alternatives();
         if(!alternatives) {
            return null;
         }
         const index = AverageCalculatorUtils.calculateAdjustedCreditIndex(alternatives);
         return index === this.adjustedCreditIndex() ? null : index;
      });
   }

   public calculateScholarship(): void {
      // TODO: open dialog
   }
}
