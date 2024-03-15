import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableModule } from '@angular/material/table';
import { AlternativeGrade, Grade } from '@apollo/averages/models';
import { TranslocoPipe } from '@ngneat/transloco';
import { CellStylePipe } from './cell-style.pipe';

@Component({
   selector: 'apo-alternatives-editing-table',
   standalone: true,
   imports: [
      CommonModule,
      TranslocoPipe,
      MatTableModule,
      FormsModule,
      MatButtonModule,
      CellStylePipe
   ],
   templateUrl: './alternatives-editing-table.component.html',
   styleUrl: './alternatives-editing-table.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlternativesEditingTableComponent {
   public readonly displayedColumns = ['name', 'rating', 'credit', 'remove'];

   @Input() public titleKey!: string;
   @Input() originalGrades: Grade[] = [];
   @Input() alternativeGrades: AlternativeGrade[] = [];

   @ViewChild(MatTable) private readonly table!: MatTable<AlternativeGrade>;

   public setGradeValue(gradeArray: AlternativeGrade[], index: number, event: any): void {
      gradeArray[index] = {
         ...gradeArray[index],
         rating: Number(event.target.value)
      };
      this.updateTable();
   }

   public toggleGrade(gradeArray: AlternativeGrade[], index: number): void {
      gradeArray[index] = {
         ...gradeArray[index],
         disabled: !gradeArray[index].disabled
      };
      this.updateTable();
   }

   public removeGrade(gradeArray: AlternativeGrade[], index: number): void {
      gradeArray.splice(index, 1);
      this.updateTable();
   }

   public addGrade(gradeArray: AlternativeGrade[]): void {
      gradeArray.push({ name: '', rating: 5, credit: 0, bonus: true });
      this.updateTable();
   }

   private updateTable(): void {
      this.table.renderRows();
   }
}
