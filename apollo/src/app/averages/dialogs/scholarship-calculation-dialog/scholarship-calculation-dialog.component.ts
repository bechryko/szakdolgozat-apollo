import { ChangeDetectionStrategy, Component, Inject, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UniversityMajor } from '@apollo/shared/models';
import { CurrencyPipe } from '@apollo/shared/pipes';
import { UniversitiesService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { ScholarshipCalculationResult } from './models';
import { ScholarshipCalculationUtils } from './scholarship-calculation.utils';

interface ScholarshipCalculationDialogData {
   adjustedCreditIndex: number;
   alternativeAdjustedCreditIndex: number | null;
   majorId: string;
   isFirstSemester: boolean;
}

interface ScholarshipAmounts {
   normal: ScholarshipCalculationResult;
   alternative: ScholarshipCalculationResult | null;
}

@Component({
   selector: 'apo-scholarship-calculation-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      NgLetModule,
      MatIconModule,
      CurrencyPipe,
      MatButtonModule
   ],
   templateUrl: './scholarship-calculation-dialog.component.html',
   styleUrl: './scholarship-calculation-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScholarshipCalculationDialogComponent {
   private readonly major: Signal<UniversityMajor | undefined>;

   public readonly averageScholarship: Signal<ScholarshipAmounts | undefined>;
   public readonly probabilisticScholarship: Signal<ScholarshipAmounts | undefined>;

   constructor(
      private readonly dialogRef: MatDialogRef<ScholarshipCalculationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ScholarshipCalculationDialogData,
      private readonly universitiesService: UniversitiesService
   ) {
      this.major = toSignal(this.universitiesService.getMajor(data.majorId));

      this.averageScholarship = computed(() => {
         const major = this.major();
         if(!major?.scholarships) {
            return undefined;
         }

         const scholarshipDatas = major.scholarships
            .map(scholarshipYear => data.isFirstSemester ? scholarshipYear.firstSemester : scholarshipYear.secondSemester)
            .filter(scholarshipData => scholarshipData.length >= 1);
         
         if(scholarshipDatas.length === 0) {
            return undefined;
         }

         return {
            normal: 
               ScholarshipCalculationUtils.calculateAverageScholarship(data.adjustedCreditIndex, scholarshipDatas),
            alternative: 
               data.alternativeAdjustedCreditIndex
                  ? ScholarshipCalculationUtils.calculateAverageScholarship(data.alternativeAdjustedCreditIndex, scholarshipDatas)
                  : null
         };
      });

      this.probabilisticScholarship = computed(() => {
         const major = this.major();
         if(!major?.scholarships) {
            return undefined;
         }

         const scholarshipDatas = major.scholarships
            .map(scholarshipYear => data.isFirstSemester ? scholarshipYear.firstSemester : scholarshipYear.secondSemester)
            .filter(scholarshipData => scholarshipData.length >= 2);
         
         if(scholarshipDatas.length === 0) {
            return undefined;
         }

         return {
            normal: 
               ScholarshipCalculationUtils.calculateProbabilisticScholarship(data.adjustedCreditIndex, scholarshipDatas),
            alternative: 
               data.alternativeAdjustedCreditIndex
                  ? ScholarshipCalculationUtils.calculateProbabilisticScholarship(data.alternativeAdjustedCreditIndex, scholarshipDatas)
                  : null
         };
      });
   }

   public close(): void {
      this.dialogRef.close();
   }
}
