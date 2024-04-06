import { ChangeDetectionStrategy, Component, Signal, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
   selector: 'apo-state-scholarship-information-icon',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatIconModule,
      MatTooltipModule
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
