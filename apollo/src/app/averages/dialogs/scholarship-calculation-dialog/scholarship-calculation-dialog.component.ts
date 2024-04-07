import { ChangeDetectionStrategy, Component, Inject, Signal, computed, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UniversityMajor } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { CurrencyPipe } from '@apollo/shared/pipes';
import { ScholarshipCalculationResult } from './models';
import { ScholarshipCalculationUtils } from './utils';

interface ScholarshipCalculationDialogData {
   adjustedCreditIndex: number;
   alternativeAdjustedCreditIndex: number | null;
   major: UniversityMajor;
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
      ApolloCommonModule,
      CurrencyPipe
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
      @Inject(MAT_DIALOG_DATA) public data: ScholarshipCalculationDialogData
   ) {
      this.major = signal(data.major);
      
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
