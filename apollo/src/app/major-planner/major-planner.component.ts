import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MajorPlan } from './models';
import { MajorPlannerService } from './services';
import { SubjectPlanChartComponent } from './subject-plan-chart';

@Component({
   selector: 'apo-major-planner',
   standalone: true,
   imports: [
      SubjectPlanChartComponent
   ],
   providers: [
      MajorPlannerService
   ],
   templateUrl: './major-planner.component.html',
   styleUrl: './major-planner.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MajorPlannerComponent {
   public readonly majorPlan: Signal<MajorPlan | undefined>;

   constructor(private readonly majorPlannerService: MajorPlannerService) {
      this.majorPlan = toSignal(
         this.majorPlannerService.majorPlan$.pipe(
            takeUntilDestroyed()
         )
      );
   }
}
