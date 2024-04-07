import { ChangeDetectionStrategy, Component, Input, ViewChild, WritableSignal, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { FileUploadComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { GeneralDialogService } from '@apollo/shared/general-dialog';
import { UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { Grade } from '../../../models';

@Component({
   selector: 'apo-grade-editing-table',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatTableModule,
      FormsModule,
      FileUploadComponent,
      MatSelectModule
   ],
   templateUrl: './grade-editing-table.component.html',
   styleUrl: './grade-editing-table.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeEditingTableComponent {
   public readonly displayedColumns = ['name', 'code', 'credit', 'rating', 'remove'];
   public readonly confirmationDialogTableHeaderKeys = [
      "AVERAGES.DIALOGS.TABLE_HEADERS.NAME",
      "AVERAGES.DIALOGS.TABLE_HEADERS.CODE",
      "AVERAGES.DIALOGS.TABLE_HEADERS.CREDIT",
      "AVERAGES.DIALOGS.TABLE_HEADERS.RATING"
   ];

   @Input() public titleKey!: string;
   @Input() grades: Grade[] = [];
   public readonly universitySubjects = input.required<UniversitySubject[]>();
   public readonly selectedSubject: WritableSignal<UniversitySubject | null>;

   @ViewChild(MatTable) private readonly table!: MatTable<Grade>;

   constructor(
      private readonly generalDialogService: GeneralDialogService
   ) {
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
            code: '',
            rating: 5,
            credit: 0
         });
      }
      this.updateTable();
   }

   public fileUpload(newGrades: Grade[], gradeArray: Grade[]): void {
      this.generalDialogService.openDialog({
         title: "AVERAGES.DIALOGS.ERASE_GRADES_ON_UPLOAD.TITLE",
         content: "AVERAGES.DIALOGS.ERASE_GRADES_ON_UPLOAD.CONTENT",
         accept: "AVERAGES.DIALOGS.ERASE_GRADES_ON_UPLOAD.CONFIRM",
         cancel: "AVERAGES.DIALOGS.ERASE_GRADES_ON_UPLOAD.REJECT"
      }).subscribe(eraseData => {
         if(eraseData) {
            gradeArray.splice(0, gradeArray.length);
         }

         newGrades.forEach(grade => {
            gradeArray.push(grade);
         });
         this.updateTable();
      });
   }

   public fileParserFn(exported: string): Grade[] {
      return NeptunExportParserUtils.parseSemesterGrades(exported);
   }
}
