import { ChangeDetectionStrategy, Component, Input, ViewChild, WritableSignal, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { FileUploadComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { UniversitySubject } from '@apollo/shared/models';
import { TranslocoPipe } from '@ngneat/transloco';
import { Grade } from '../../../models';

@Component({
   selector: 'apo-grade-editing-table',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatTableModule,
      FormsModule,
      MatButtonModule,
      FileUploadComponent,
      MatSelectModule
   ],
   templateUrl: './grade-editing-table.component.html',
   styleUrl: './grade-editing-table.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeEditingTableComponent {
   public readonly displayedColumns = ['name', 'rating', 'credit', 'remove'];
   public readonly confirmationDialogTableHeaderKeys = [
      "AVERAGES.DIALOGS.TABLE_HEADERS.NAME",
      "AVERAGES.DIALOGS.TABLE_HEADERS.RATING",
      "AVERAGES.DIALOGS.TABLE_HEADERS.CREDIT"
   ];

   @Input() public titleKey!: string;
   @Input() grades: Grade[] = [];
   public readonly universitySubjects = input.required<UniversitySubject[]>();
   public readonly selectedSubject: WritableSignal<UniversitySubject | null>;

   @ViewChild(MatTable) private readonly table!: MatTable<Grade>;

   constructor() {
      this.selectedSubject = signal(null);
   }

   public removeGrade(gradeArray: Grade[], index: number): void {
      gradeArray.splice(index, 1);
      this.updateTable();
   }

   private updateTable(): void {
      this.table.renderRows();
   }

   public addGrade(gradeArray: Grade[]): void {
      const subject = this.selectedSubject();
      if(subject) {
         gradeArray.push({
            name: subject.name,
            rating: 5,
            credit: subject.credit,
            code: subject.code
         });
      } else {
         gradeArray.push({
            name: '',
            rating: 5,
            credit: 0
         });
      }
      this.updateTable();
   }

   public fileUpload(newGrades: Grade[], gradeArray: Grade[]): void {
      gradeArray.push(...newGrades);
      this.updateTable();
   }

   public fileParserFn(exported: string): Grade[] {
      return NeptunExportParserUtils.parseSemesterGrades(exported);
   }
}
