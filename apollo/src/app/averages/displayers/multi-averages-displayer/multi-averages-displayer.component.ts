import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Signal, WritableSignal, computed, input, signal } from '@angular/core';
import { UniversityMajor } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { DisplayValuePipe } from '@apollo/shared/pipes';
import { isEqual } from 'lodash';
import { AlternativeGrade, CreditSum, Grade, GradesCompletionYear } from '../../models';
import { AverageCalculatorUtils } from '../../utils';
import { AveragesDisplayerComponent } from '../averages-displayer';
import { StateScholarshipInformationIconComponent } from './state-scholarship-information-icon';

@Component({
   selector: 'apo-multi-averages-displayer',
   standalone: true,
   imports: [
      ApolloCommonModule,
      AveragesDisplayerComponent,
      DisplayValuePipe,
      StateScholarshipInformationIconComponent
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
   public readonly userMajor = input.required<UniversityMajor | null>();

   public readonly years: WritableSignal<GradesCompletionYear[]>;
   private readonly gradesCollected: Signal<Grade[]>;
   public readonly weightedAverage: Signal<number>;
   public readonly creditSum: Signal<CreditSum>;
   public readonly creditIndex: Signal<number>;
   public readonly adjustedCreditIndex: Signal<number>;

   public readonly areAlternativesSet: Signal<boolean>;
   private readonly alternativeYears: Signal<GradesCompletionYear[]>;
   private readonly alternativesCollected: Signal<AlternativeGrade[]>;
   public readonly alternativeWeightedAverage: Signal<number | null>;
   public readonly alternativeCreditSum: Signal<CreditSum | null>;
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

      this.areAlternativesSet = computed(() => this.years().some(
         year => year.alternativeGrades?.firstSemester?.length || year.alternativeGrades?.secondSemester?.length
      ));
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
         return isEqual(sum, this.creditSum()) ? null : sum;
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
