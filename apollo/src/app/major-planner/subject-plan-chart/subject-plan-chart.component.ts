import { ChangeDetectionStrategy, Component, effect, ElementRef, input, Signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@ngneat/transloco';
import { isEmpty } from 'lodash';
import { forkJoin, Observable, take } from 'rxjs';
import { MajorPlan } from '../models';
import { ChartSetupUtils } from './utils';

@Component({
   selector: 'apo-subject-plan-chart',
   standalone: true,
   imports: [],
   templateUrl: './subject-plan-chart.component.html',
   styleUrl: './subject-plan-chart.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubjectPlanChartComponent {
   public readonly majorPlan = input.required<MajorPlan>();
   private readonly chartAreaElement = viewChild.required<ElementRef<HTMLElement>>('chartArea');
   private readonly translations: Signal<Record<string, string>>;

   constructor(
      private readonly transloco: TranslocoService
   ) {
      this.translations = toSignal(
         forkJoin<Record<string, Observable<string>>>({
            credit: this.transloco.selectTranslate("UNIT.CREDIT").pipe(take(1)),
            creditSum: this.transloco.selectTranslate("MAJOR_PLANNER.GRAPH.CREDIT_SUM").pipe(take(1))
         }),
         { initialValue: {} }
      );

      effect(() => {
         const translations = this.translations();

         if (!isEmpty(translations)) {
            ChartSetupUtils.initGraph(this.chartAreaElement().nativeElement, this.majorPlan(), translations);
         }
      });
   }
}
