import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { UniversityCompletionYear, UniversityMajor, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { GetSubjectsPipe } from '@apollo/shared/pipes';
import { CompletionsService } from '@apollo/shared/services';
import { map, startWith } from 'rxjs';
import { CompletionManagerDialogComponent } from './completion-manager-dialog';
import { CompletionManagerDialogData } from './completion-manager-dialog/models/completion-manager-dialog-data';
import { FilterCompletedPipe, MissingCreditsPipe } from './pipes';

@Component({
   selector: 'apo-major-completion',
   standalone: true,
   imports: [
      ApolloCommonModule,
      GetSubjectsPipe,
      FilterCompletedPipe,
      MissingCreditsPipe,
      MatExpansionModule
   ],
   templateUrl: './major-completion.component.html',
   styleUrl: './major-completion.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MajorCompletionComponent {
   public readonly userMajor: Signal<UniversityMajor>;
   public readonly universitySubjects: Signal<UniversitySubject[]>;
   public readonly userCompletions: Signal<UniversityCompletionYear[]>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly completionsService: CompletionsService,
      private readonly dialog: MatDialog
   ) {
      this.userMajor = toSignal(this.activatedRoute.data.pipe(
         map(({ userMajor }) => userMajor)
      ));

      this.universitySubjects = toSignal(this.activatedRoute.data.pipe(
         map(({ universitySubjects }) => universitySubjects)
      ));

      this.userCompletions = toSignal(this.completionsService.universityCompletions$.pipe(
         startWith([])
      )) as Signal<UniversityCompletionYear[]>;
   }

   public manageCompletions(): void {
      this.dialog.open<CompletionManagerDialogComponent, CompletionManagerDialogData, UniversityCompletionYear[]>(CompletionManagerDialogComponent, {
         data: {
            completions: this.userCompletions(),
            universitySubjects: this.universitySubjects()
         }
      }).afterClosed().subscribe(updatedCompletions => {
         if (!updatedCompletions) {
            return;
         }

         this.completionsService.saveUniversityCompletions(updatedCompletions);
      });
   }

   public completeSubject(subject: UniversitySubject): void {
      this.completionsService.completeSubject(subject);
   }
}
