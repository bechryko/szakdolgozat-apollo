import { ChangeDetectionStrategy, Component, Inject, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { newCompletionDefaultRating } from '@apollo/shared/constants';
import { orderSubject } from '@apollo/shared/functions';
import { UniversityCompletionYear, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { AsAnyPipe } from '@apollo/shared/pipes';
import { UserService } from '@apollo/shared/services';
import { TranslocoService } from '@ngneat/transloco';
import { isEqual, orderBy } from 'lodash';
import { map, take } from 'rxjs';
import { CompletionsSort } from './enums';
import { CompletionGroup, CompletionManagerDialogData, CompletionYearSkeleton, ManagableSubjectCompletion, NormalManagableSubjectCompletion } from './models';
import { CompletionMapperUtils, CompletionsSortUtils } from './utils';

@Component({
   selector: 'apo-completion-manager-dialog',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatTableModule,
      MatSelectModule,
      FormsModule,
      MatChipsModule,
      AsAnyPipe,
      MatCheckboxModule
   ],
   templateUrl: './completion-manager-dialog.component.html',
   styleUrl: './completion-manager-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompletionManagerDialogComponent {
   public readonly displayedColumns: string[] = ['name', 'code', 'rating', 'credit', 'year', 'firstSemester', 'remove'];

   public readonly completionsSort = CompletionsSort;
   public readonly sortTypes = Object.values(CompletionsSort);
   public readonly selectedSortType: WritableSignal<CompletionsSort>;

   private readonly completions: WritableSignal<ManagableSubjectCompletion[]>;
   public readonly displayedCompletions: Signal<CompletionGroup[]>;
   public readonly completionYears: WritableSignal<CompletionYearSkeleton[]>;

   public readonly completableSubjects: Signal<UniversitySubject[]>;
   public readonly selectedSubject: WritableSignal<UniversitySubject | null>;

   constructor(
      private readonly dialogRef: MatDialogRef<CompletionManagerDialogComponent, UniversityCompletionYear[]>,
      @Inject(MAT_DIALOG_DATA) private readonly data: CompletionManagerDialogData,
      transloco: TranslocoService,
      private readonly userService: UserService
   ) {
      this.selectedSortType = signal(CompletionsSort.NAME);
      this.completions = signal(CompletionMapperUtils.mapCompletionYearsToManagableSubjectCompletions(this.data.completions));
      this.completionYears = signal(CompletionMapperUtils.mapCompletionYearsToCompletionYearSkeletons(this.data.completions));
      this.selectedSubject = signal(null);

      this.displayedCompletions = computed(() => {
         switch (this.selectedSortType()) {
            case CompletionsSort.NAME:
               return [{ completions: orderSubject(this.completions()) }];
            case CompletionsSort.YEAR:
               return orderBy(CompletionsSortUtils.sortByYear(this.completions(), transloco), 'name');
         }
      });

      this.completableSubjects = computed(() => {
         return this.data.universitySubjects.filter(subject => !this.completions().some(completion => completion.code === subject.code));
      });
   }

   public removeCompletion(completion: ManagableSubjectCompletion): void {
      this.completions.set(this.completions().filter(c => !isEqual(c, completion)));
   }

   public addCompletion(): void {
      const selectedSubject = this.selectedSubject();

      if (!selectedSubject) {
         return;
      }

      this.completions.set([
         ...this.completions(),
         {
            completionYearId: null,
            code: selectedSubject.code,
            name: selectedSubject.name,
            credit: selectedSubject.credit,
            rating: newCompletionDefaultRating
         }
      ]);

      this.selectedSubject.set(null);
   }

   public toggleSemester(completion: NormalManagableSubjectCompletion): void {
      const newCompletion = { ...completion, isFirstSemesterCompletion: !completion.isFirstSemesterCompletion };
      this.completions.set([
         ...this.completions().filter(c => !isEqual(c, completion)),
         newCompletion
      ]);
   }

   public changeYear(completion: ManagableSubjectCompletion, yearId: string): void {
      this.completions.set([
         ...this.completions().filter(c => !isEqual(c, completion)),
         this.getNewCompletion(completion, yearId)
      ]);
   }

   public save(): void {
      this.userService.user$.pipe(
         take(1),
         map(user => user!.email)
      ).subscribe(email => this.dialogRef.close(CompletionMapperUtils.mapManagableSubjectCompletionsToCompletionYears(this.completions(), email)));
   }

   private getNewCompletion(completion: ManagableSubjectCompletion, yearId: string): ManagableSubjectCompletion {
      if(yearId === null) {
         return { ...completion, completionYearId: null };
      }

      return {
         ...completion,
         completionYearId: yearId,
         completionYearName: this.completionYears().find(year => year.id === yearId)?.name!,
         isFirstSemesterCompletion: true
      };
   }
}
