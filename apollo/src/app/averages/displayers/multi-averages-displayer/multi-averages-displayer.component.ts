import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { AlternativeGrade, Grade, GradesCompletionYear } from '../../models';
import { AverageCalculatorUtils } from '../../utils';
import { AveragesDisplayerComponent } from '../averages-displayer';

@Component({
   selector: 'apo-multi-averages-displayer',
   standalone: true,
   imports: [
      TranslocoPipe,
      AveragesDisplayerComponent,
      MatButtonModule,
      NgLetModule,
      MatIconModule
   ],
   templateUrl: './multi-averages-displayer.component.html',
   styleUrl: './multi-averages-displayer.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiAveragesDisplayerComponent { // TODO: add diagrams
   @Input() public title: string = "";
   @Input() public yearDisplay: boolean = false;
   @Input() set yearData(value: GradesCompletionYear[]) {
      this.years.set(value);
   }
   public readonly years: WritableSignal<GradesCompletionYear[]>;
   private readonly gradesCollected: Signal<Grade[]>;
   public readonly weightedAverage: Signal<number>;
   public readonly creditSum: Signal<number>;
   public readonly creditIndex: Signal<number>;
   public readonly adjustedCreditIndex: Signal<number>;

   private readonly alternativeYears: Signal<GradesCompletionYear[]>;
   private readonly alternativesCollected: Signal<AlternativeGrade[]>;
   public readonly alternativeWeightedAverage: Signal<number | null>;
   public readonly alternativeCreditSum: Signal<number | null>;
   public readonly alternativeCreditIndex: Signal<number | null>;
   public readonly alternativeAdjustedCreditIndex: Signal<number | null>;

   @Output() public readonly setAlternatives: EventEmitter<void> = new EventEmitter();

   constructor() {
      this.years = signal([]);

      this.gradesCollected = computed(() => [ ...this.years().map(year => year.firstSemesterGrades.concat(year.secondSemesterGrades)) ].flat());
      this.weightedAverage = computed(() => AverageCalculatorUtils.calculateWeightedAverage(this.gradesCollected()));
      this.creditSum = computed(() => AverageCalculatorUtils.sumCredits(this.gradesCollected()));
      this.creditIndex = computed(() => AverageCalculatorUtils.calculateCreditIndexForMultipleYears(this.years()));
      this.adjustedCreditIndex = computed(() => AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(this.years()));

      this.alternativeYears = computed(() => {
         return this.years().map(year => {
            const firstSemesterGrades = year.alternativeGrades?.firstSemester
               ? year.alternativeGrades.firstSemester.filter(grade => !grade.disabled)
               : year.firstSemesterGrades;
            const secondSemesterGrades = year.alternativeGrades?.secondSemester
               ? year.alternativeGrades.secondSemester.filter(grade => !grade.disabled)
               : year.secondSemesterGrades;

            return {
               ...year,
               firstSemesterGrades,
               secondSemesterGrades
            };
         });
      });
      this.alternativesCollected = computed(() => {
         return [ ...this.alternativeYears().map(year => year.firstSemesterGrades.concat(year.secondSemesterGrades)) ].flat();
      });
      this.alternativeWeightedAverage = computed(() => {
         const alternatives = this.alternativesCollected();
         if(!alternatives.length) {
            return null;
         }
         const average = AverageCalculatorUtils.calculateWeightedAverage(alternatives);
         return average === this.weightedAverage() ? null : average;
      });
      this.alternativeCreditSum = computed(() => {
         const alternatives = this.alternativesCollected();
         if(!alternatives.length) {
            return null;
         }
         const sum = AverageCalculatorUtils.sumCredits(alternatives);
         return sum === this.creditSum() ? null : sum;
      });
      this.alternativeCreditIndex = computed(() => {
         const alternativeYears = this.alternativeYears();
         const index = AverageCalculatorUtils.calculateCreditIndexForMultipleYears(alternativeYears);
         return index === this.creditIndex() ? null : index;
      });
      this.alternativeAdjustedCreditIndex = computed(() => {
         const alternativeYears = this.alternativeYears();
         const index = AverageCalculatorUtils.calculateAdjustedCreditIndexForMultipleYears(alternativeYears);
         return index === this.adjustedCreditIndex() ? null : index;
      });
   }

   public onSetAlternatives(): void {
      this.setAlternatives.emit();
   }
}
