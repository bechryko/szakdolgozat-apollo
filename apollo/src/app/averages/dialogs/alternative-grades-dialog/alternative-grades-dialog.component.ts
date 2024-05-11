import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlternativeGrade } from '@apollo/averages/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { cloneDeep, isEqual } from 'lodash';
import { AlternativeGradesDialogData, AlternativeGradesDialogOutputData } from './alternative-grades-dialog-data';
import { AlternativesEditingTableComponent } from './alternatives-editing-table/alternatives-editing-table.component';

@Component({
   selector: 'apo-alternative-grades-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      AlternativesEditingTableComponent
   ],
   templateUrl: './alternative-grades-dialog.component.html',
   styleUrl: './alternative-grades-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlternativeGradesDialogComponent {
   public alternativeFirstSemesterGrades: AlternativeGrade[];
   public alternativeSecondSemesterGrades: AlternativeGrade[];

   constructor(
      private readonly dialogRef: MatDialogRef<AlternativeGradesDialogComponent, AlternativeGradesDialogOutputData>,
      @Inject(MAT_DIALOG_DATA) public readonly data: AlternativeGradesDialogData
   ) {
      this.alternativeFirstSemesterGrades = cloneDeep(data.alternativeFirstSemesterGrades ?? data.originalFirstSemesterGrades);
      this.alternativeSecondSemesterGrades = cloneDeep(data.alternativeSecondSemesterGrades ?? data.originalSecondSemesterGrades);
   }

   public reset(): void {
      this.alternativeFirstSemesterGrades = cloneDeep(this.data.originalFirstSemesterGrades);
      this.alternativeSecondSemesterGrades = cloneDeep(this.data.originalSecondSemesterGrades);
   }

   public save(): void {
      if(isEqual(this.alternativeFirstSemesterGrades, this.data.originalFirstSemesterGrades) && isEqual(this.alternativeSecondSemesterGrades, this.data.originalSecondSemesterGrades)) {
         this.dialogRef.close({});
         return;
      }

      this.dialogRef.close({
         alternativeFirstSemesterGrades: this.alternativeFirstSemesterGrades!.map(grade => ({
            ...grade,
            credit: Number(grade.credit)
         })),
         alternativeSecondSemesterGrades: this.alternativeSecondSemesterGrades!.map(grade => ({
            ...grade,
            credit: Number(grade.credit)
         }))
      });
   }
}
