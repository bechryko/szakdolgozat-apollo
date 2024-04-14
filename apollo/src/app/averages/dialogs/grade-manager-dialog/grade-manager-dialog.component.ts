import { ChangeDetectionStrategy, Component, Inject, Signal, ViewChildren, WritableSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { Grade, GradesCompletionYear } from '@apollo/averages/models';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { UniversitiesService, UserService } from '@apollo/shared/services';
import { cloneDeep } from 'lodash';
import { EMPTY, startWith, switchMap } from 'rxjs';
import { GradeEditingTableComponent } from './grade-editing-table/grade-editing-table.component';
import { GradeManagerDialogData } from './grade-manager-dialog-data';

@Component({
   selector: 'apo-grade-manager-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatSelectModule,
      FormsModule,
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

   public readonly universitySubjects: Signal<UniversitySubject[]>;

   @ViewChildren(MatTable) private readonly table!: MatTable<Grade>[];

   constructor(
      private readonly dialogRef: MatDialogRef<GradeManagerDialogComponent, GradeManagerDialogData>,
      @Inject(MAT_DIALOG_DATA) data: GradeManagerDialogData,
      private readonly dialog: MatDialog,
      private readonly userService: UserService,
      private readonly universitiesService: UniversitiesService
   ) {
      this.data = cloneDeep(data);
      
      this.years = signal(this.data.years);
      this.selectedYear = signal(this.data.years.find(year => year.id === this.data.selectedYearId));

      this.universitySubjects = toSignal(this.userService.user$.pipe(
         switchMap(user => {
            if(!user?.university) {
               return EMPTY;
            }

            return this.universitiesService.getSubjectsForUniversity(user.university);
         }),
         startWith([])
      )) as Signal<UniversitySubject[]>;
   }

   public selectYear(year: GradesCompletionYear): void {
      this.selectedYear.set(year);
   }

   public addYear(): void {
      this.dialog.open(GeneralInputDialogComponent<String>, {
         data: {
            title: "COMPLETION_YEAR_ADD_DIALOG.TITLE",
            description: "COMPLETION_YEAR_ADD_DIALOG.DESCRIPTION",
            inputType: 'text',
            inputLabel: "COMPLETION_YEAR_ADD_DIALOG.INPUT_LABEL"
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
      this.dialogRef.close({
         years: this.years(),
         selectedYearId: this.selectedYear()!.id
      });
   }
}
