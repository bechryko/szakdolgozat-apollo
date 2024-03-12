import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, ViewChildren, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { Grade, GradesCompletionYear } from '@apollo/averages/models';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { numberize } from '@apollo/shared/functions';
import { TranslocoPipe } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { GradeEditingTableComponent } from './grade-editing-table/grade-editing-table.component';
import { GradeManagerDialogData } from './grade-manager-dialog-data';

@Component({
   selector: 'apo-grade-manager-dialog',
   standalone: true,
   imports: [
      CommonModule,
      TranslocoPipe,
      MatFormFieldModule,
      MatSelectModule,
      FormsModule,
      MatButtonModule,
      GradeEditingTableComponent
   ],
   templateUrl: './grade-manager-dialog.component.html',
   styleUrl: './grade-manager-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeManagerDialogComponent {
   private readonly data: GradeManagerDialogData;
   public readonly years: WritableSignal<GradesCompletionYear[]>;
   public readonly selectedYear: WritableSignal<GradesCompletionYear | undefined>;

   @ViewChildren(MatTable) private readonly table!: MatTable<Grade>[];

   constructor(
      private readonly dialogRef: MatDialogRef<GradeManagerDialogComponent, GradeManagerDialogData>,
      @Inject(MAT_DIALOG_DATA) data: GradeManagerDialogData,
      private readonly dialog: MatDialog
   ) {
      this.data = cloneDeep(data);
      
      this.years = signal(this.data.years);
      this.selectedYear = signal(this.data.years.find(year => year.id === this.data.selectedYearId));
   }

   public selectYear(year: GradesCompletionYear): void {
      this.selectedYear.set(year);
   }

   public addYear(): void {
      this.dialog.open(GeneralInputDialogComponent<String>, {
         data: {
            title: "AVERAGES.YEAR_ADD_DIALOG.TITLE",
            inputType: 'text',
            inputLabel: "AVERAGES.YEAR_ADD_DIALOG.INPUT_LABEL"
         }
      }).afterClosed().subscribe((semesterName: string) => {
         if(!semesterName) {
            return;
         }
         
         const newYear: GradesCompletionYear = {
            id: Date.now().toString(),
            name: semesterName,
            owner: '',
            firstSemesterGrades: [],
            secondSemesterGrades: []
         };
         this.years().push(newYear);
         this.selectedYear.set(newYear);
      });
   }

   public save(): void {
      const years = this.years();

      years.forEach(year => {
         year.firstSemesterGrades = year.firstSemesterGrades.map(grade => numberize<Grade>(grade, 'name'));
         year.secondSemesterGrades = year.secondSemesterGrades.map(grade => numberize<Grade>(grade, 'name'));
      });

      this.dialogRef.close({
         years,
         selectedYearId: this.selectedYear()!.id
      });
   }
}
