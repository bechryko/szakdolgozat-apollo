import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { UniversityCompletionYear, UniversityMajor, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { GetSubjectsPipe } from '@apollo/shared/pipes';
import { CompletionsService } from '@apollo/shared/services';
import { map, startWith } from 'rxjs';
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
export class MajorCompletionComponent { // TODO: display specialization completion
   public readonly userMajor: Signal<UniversityMajor>;
   public readonly universitySubjects: Signal<UniversitySubject[]>;
   public readonly userCompletions: Signal<UniversityCompletionYear[]>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly completionsService: CompletionsService
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

   public completeSubject(subject: UniversitySubject): void {
      this.completionsService.completeSubject(subject);
   }
}
