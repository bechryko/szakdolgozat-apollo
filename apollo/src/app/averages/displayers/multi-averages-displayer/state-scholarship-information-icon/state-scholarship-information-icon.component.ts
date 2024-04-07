import { ChangeDetectionStrategy, Component, Signal, computed, input } from '@angular/core';
import { ApolloCommonModule } from '@apollo/shared/modules';

@Component({
   selector: 'apo-state-scholarship-information-icon',
   standalone: true,
   imports: [
      ApolloCommonModule
   ],
   templateUrl: './state-scholarship-information-icon.component.html',
   styleUrl: './state-scholarship-information-icon.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateScholarshipInformationIconComponent {
   public readonly average = input.required<number>();
   public readonly required = input.required<number>();
   public readonly noWarnRequired: Signal<number>;

   constructor() {
      this.noWarnRequired = computed(() => this.required() * 1.1);
   }
}
