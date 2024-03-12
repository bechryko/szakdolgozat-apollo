import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableModule } from '@angular/material/table';
import { FileUploadDataConfirmationDialogComponent } from '@apollo/shared/components';
import { readFile } from '@apollo/shared/functions';
import { NeptunExportParserUtils } from '@apollo/shared/utils';
import { TranslocoPipe } from '@ngneat/transloco';
import { Grade } from '../../../models';

@Component({
   selector: 'apo-grade-editing-table',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatTableModule,
      FormsModule,
      MatButtonModule
   ],
   templateUrl: './grade-editing-table.component.html',
   styleUrl: './grade-editing-table.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeEditingTableComponent {
   public readonly displayedColumns = ['name', 'rating', 'credit', 'remove'];

   @Input() public titleKey!: string;
   @Input() grades: Grade[] = [];

   @ViewChild(MatTable) private readonly table!: MatTable<Grade>;
   
   constructor(
      private readonly dialog: MatDialog
   ) { }

   public removeGrade(gradeArray: Grade[], index: number): void {
      gradeArray.splice(index, 1);
      this.updateTable();
   }

   private updateTable(): void {
      this.table.renderRows();
   }

   public addGrade(gradeArray: Grade[]): void {
      gradeArray.push({
         name: '',
         rating: 5,
         credit: 0
      });
      this.updateTable();
   }

   public fileUpload(event: Event, gradeArray: Grade[]): void {
      const inputElement = event.target as HTMLInputElement;
      readFile(inputElement.files![0], s => NeptunExportParserUtils.parseSemesterGrades(s)).then(grades => {
         this.dialog.open(FileUploadDataConfirmationDialogComponent, {
            data: {
               data: grades,
               columnNameKeys: [
                  "AVERAGES.GRADE_MANAGER_DIALOG.TABLE_HEADERS.NAME",
                  "AVERAGES.GRADE_MANAGER_DIALOG.TABLE_HEADERS.RATING",
                  "AVERAGES.GRADE_MANAGER_DIALOG.TABLE_HEADERS.CREDIT"
               ]
            }
         }).afterClosed().subscribe(confirmed => {
            if(confirmed) {
               gradeArray.push(...grades);
               this.updateTable();
            }
            inputElement.value = '';
         });
      }).catch((errorKey: string) => {
         // TODO: error handling
      });
   }
}
