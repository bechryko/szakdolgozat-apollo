import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@ngneat/transloco';
import { isEqual } from 'lodash';
import { tap } from 'rxjs';
import { AlternativeGradesDialogComponent, AlternativeGradesDialogData, AlternativeGradesDialogOutputData, GradeManagerDialogComponent, GradeManagerDialogData } from './dialogs';
import { AveragesDisplayerComponent, MultiAveragesDisplayerComponent } from './displayers';
import { Grade, GradesCompletionYear } from './models';
import { AveragesService } from './services';

@Component({
   selector: 'apo-averages',
   standalone: true,
   imports: [
      CommonModule,
      AveragesDisplayerComponent,
      MultiAveragesDisplayerComponent,
      MatFormFieldModule,
      MatSelectModule,
      FormsModule,
      TranslocoPipe,
      MatButtonModule
   ],
   templateUrl: './averages.component.html',
   styleUrl: './averages.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AveragesComponent {
   public readonly averages: Signal<GradesCompletionYear[] | undefined>;
   public readonly allGrades: Signal<Grade[][] | undefined>;
   private readonly selectedYearId: WritableSignal<string | undefined>;
   public readonly selectedYear: Signal<GradesCompletionYear | undefined>;
   public readonly singleYearViewMode: WritableSignal<boolean>;
   
   constructor(
      private readonly averagesService: AveragesService,
      private readonly dialog: MatDialog
   ) {
      this.selectedYearId = signal(undefined);
      this.averages = toSignal(this.averagesService.grades$.pipe(
         tap(grades => {
            if(!this.selectedYearId()) {
               this.selectedYearId.set(this.getStartingSelectedYearId(grades));
            }
         })
      ));
      this.allGrades = computed(() => {
         const averages = this.averages();
         if(!averages) {
            return;
         }

         return averages.map(average => [average.firstSemesterGrades, average.secondSemesterGrades]).flat();
      });
      this.selectedYear = computed(() => {
         const averages = this.averages();
         if(!averages) {
            return;
         }

         return averages.find(average => average.id === this.selectedYearId());
      });
      this.singleYearViewMode = signal(false);
   }

   public toggleViewMode(): void {
      this.singleYearViewMode.set(!this.singleYearViewMode());
   }

   public selectYear(year: GradesCompletionYear): void {
      this.selectedYearId.set(year.id);
   }

   public manageGrades(): void {
      this.dialog.open<GradeManagerDialogComponent, GradeManagerDialogData, GradeManagerDialogData>(GradeManagerDialogComponent, {
         data: {
            years: this.averages()!,
            selectedYearId: this.selectedYear()?.id
         }
      }).afterClosed().subscribe(data => {
         if(!data) {
            return;
         }

         this.selectedYearId.set(data.selectedYearId);
         this.averagesService.saveAverages(data.years);
      });
   }

   public openAlternativesDialog(year: GradesCompletionYear): void {
      this.dialog.open<AlternativeGradesDialogComponent, AlternativeGradesDialogData, AlternativeGradesDialogOutputData>(AlternativeGradesDialogComponent, {
         data: {
            yearName: year.name,
            originalFirstSemesterGrades: year.firstSemesterGrades,
            originalSecondSemesterGrades: year.secondSemesterGrades,
            alternativeFirstSemesterGrades: year.alternativeGrades?.firstSemester,
            alternativeSecondSemesterGrades: year.alternativeGrades?.secondSemester
         }
      }).afterClosed().subscribe(data => {
         if(!data) {
            return;
         }

         if(!isEqual(year.alternativeGrades?.firstSemester, data.alternativeFirstSemesterGrades)) {
            this.averagesService.saveAlternativeSemester({
               id: year.id,
               type: 'firstSemesterGrades',
               grades: data.alternativeFirstSemesterGrades,
               original: year.firstSemesterGrades
            });
         }
         if(!isEqual(year.alternativeGrades?.secondSemester, data.alternativeSecondSemesterGrades)) {
            this.averagesService.saveAlternativeSemester({
               id: year.id,
               type: 'secondSemesterGrades',
               grades: data.alternativeSecondSemesterGrades,
               original: year.secondSemesterGrades
            });
         }
      });
   }

   private getStartingSelectedYearId(averages?: GradesCompletionYear[]): string | undefined {
      if(!averages?.length) {
         return;
      }

      return averages[averages.length - 1].id;
   }
}
