import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { UniversityMajor } from '@apollo/shared/models';
import { UserService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';
import { isEqual } from 'lodash';
import { NgLetModule } from 'ng-let';
import { Observable, map, tap } from 'rxjs';
import { AlternativeGradesDialogComponent, AlternativeGradesDialogData, AlternativeGradesDialogOutputData, GradeManagerDialogComponent, GradeManagerDialogData } from './dialogs';
import { MultiAveragesDisplayerComponent } from './displayers';
import { Grade, GradesCompletionYear } from './models';
import { AveragesService } from './services';

@Component({
   selector: 'apo-averages',
   standalone: true,
   imports: [
      AsyncPipe,
      NgLetModule,
      MultiAveragesDisplayerComponent,
      MatFormFieldModule,
      MatSelectModule,
      FormsModule,
      TranslocoPipe,
      MatButtonModule,
      MatIconModule,
      GeneralInputDialogComponent
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

   public readonly isUserLoggedOut$: Observable<boolean>;
   public readonly userMajor: Signal<UniversityMajor | null>;
   
   constructor(
      private readonly averagesService: AveragesService,
      private readonly dialog: MatDialog,
      private readonly userService: UserService,
      private readonly activatedRoute: ActivatedRoute
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

      if(this.averages()?.length === 0) {
         this.dialog.open(GeneralInputDialogComponent, {
            data: {
               title: "AVERAGES.NO_DATA_DIALOG.TITLE",
               description: "AVERAGES.NO_DATA_DIALOG.DESCRIPTION",
               inputType: 'text',
               inputLabel: "AVERAGES.YEAR_ADD_DIALOG.INPUT_LABEL",
               submitLabel: "AVERAGES.NO_DATA_DIALOG.SUBMIT_LABEL"
            }
         }).afterClosed().subscribe(yearName => {
            if(yearName) {
               this.averagesService.saveAverages([{
                  id: Date.now().toString(),
                  name: yearName,
                  owner: "guest",
                  firstSemesterGrades: [],
                  secondSemesterGrades: []
               }]);
            }
         });
      }

      this.isUserLoggedOut$ = this.userService.isUserLoggedIn$.pipe(
         map(isLoggedIn => !isLoggedIn)
      );

      this.userMajor = toSignal(this.activatedRoute.data.pipe(
         map(({ userMajor }) => userMajor)
      ));
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

   public onDeleteGuestData(): void {
      this.averagesService.deleteGuestData();
   }

   private getStartingSelectedYearId(averages?: GradesCompletionYear[]): string | undefined {
      if(!averages?.length) {
         return;
      }

      return averages[averages.length - 1].id;
   }
}
