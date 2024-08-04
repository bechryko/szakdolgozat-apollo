import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ParameterChange, ParametersDescriptionList, ParametersSectionComponent } from '@apollo/shared/components/parameters-section';
import { MajorPlan, MajorPlannerOptions, SubjectGroupingMode } from './models';
import { MajorPlannerService } from './services';
import { SubjectPlanChartComponent } from './subject-plan-chart';

@Component({
   selector: 'apo-major-planner',
   standalone: true,
   imports: [
      SubjectPlanChartComponent,
      ParametersSectionComponent
   ],
   providers: [
      MajorPlannerService
   ],
   templateUrl: './major-planner.component.html',
   styleUrl: './major-planner.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MajorPlannerComponent {
   private readonly initialMajorPlannerOptions: MajorPlannerOptions = {
      subjectGroupingMode: SubjectGroupingMode.FLEXIBLE,
      showCredits: true
   };
   public readonly majorPlannerOptionsDescriptionList: ParametersDescriptionList<MajorPlannerOptions>;

   public readonly majorPlan: Signal<MajorPlan | undefined>;
   public readonly majorPlannerOptions: WritableSignal<MajorPlannerOptions>;

   constructor(private readonly majorPlannerService: MajorPlannerService) {
      this.majorPlannerOptions = signal(this.initialMajorPlannerOptions);

      this.majorPlan = toSignal(
         this.majorPlannerService.majorPlan$.pipe(
            takeUntilDestroyed()
         )
      );

      this.majorPlannerOptionsDescriptionList = [
         {
            parameterKey: 'subjectGroupingMode',
            parameterName: 'MAJOR_PLANNER.OPTIONS.SUBJECT_GROUPING_MODE.TITLE',
            startingValue: this.initialMajorPlannerOptions.subjectGroupingMode,
            inputType: 'select',
            options: [
               {
                  value: SubjectGroupingMode.FLEXIBLE,
                  displayValueTranslationKey: 'MAJOR_PLANNER.OPTIONS.SUBJECT_GROUPING_MODE.FLEXIBLE'
               },
               {
                  value: SubjectGroupingMode.FULL_GROUPING,
                  displayValueTranslationKey: 'MAJOR_PLANNER.OPTIONS.SUBJECT_GROUPING_MODE.FULL_GROUPING'
               },
               {
                  value: SubjectGroupingMode.STRICT_ORDER,
                  displayValueTranslationKey: 'MAJOR_PLANNER.OPTIONS.SUBJECT_GROUPING_MODE.STRICT_ORDER'
               }
            ]
         },
         {
            parameterKey: 'showCredits',
            parameterName: 'MAJOR_PLANNER.OPTIONS.SHOW_CREDITS.TITLE',
            startingValue: this.initialMajorPlannerOptions.showCredits,
            inputType: 'checkbox'
         }
      ];
   }

   public onParameterChanged(change: ParameterChange<MajorPlannerOptions>): void {
      this.majorPlannerOptions.update(options => ({
         ...options,
         [change.key]: change.value
      }));
   }
}
