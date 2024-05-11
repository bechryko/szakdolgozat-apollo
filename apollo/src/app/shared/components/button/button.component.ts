import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComponentThemeColor } from '@apollo/shared/models';
import { ButtonRole } from './button-role';

@Component({
   selector: 'apo-button',
   standalone: true,
   imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule
   ],
   templateUrl: './button.component.html',
   styleUrl: './button.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApolloButtonComponent {
   public readonly role = input.required<ButtonRole | undefined>({
      alias: 'apoRole'
   });
   public readonly disabled = input<boolean, any>(false, {
      transform: (value) => Boolean(value)
   });
   public readonly isFab = input<boolean>(false);

   public readonly color: Signal<ComponentThemeColor>;

   constructor() {
      this.color = computed(() => {
         switch (this.role()) {
            case 'save':
            case 'openDialog':
            case 'accept':
            case 'navigation':
               return 'primary';
            case 'add':
            case 'cancel':
            case 'reset':
               return 'accent';
            case 'delete':
               return 'warn';
         }
         return 'primary';
      });
   }
}
