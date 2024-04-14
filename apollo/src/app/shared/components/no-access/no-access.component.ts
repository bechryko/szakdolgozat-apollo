import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { RouteUrls } from '@apollo/app.routes';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { RouterService } from '@apollo/shared/services';

export enum AllowedReasons {
   NOT_LOGGED_IN = 'not-logged-in',
   NOT_ADMIN = 'not-admin'
}

@Component({
   selector: 'apo-no-access',
   standalone: true,
   imports: [
      ApolloCommonModule
   ],
   templateUrl: './no-access.component.html',
   styleUrl: './no-access.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoAccessComponent {
   public readonly allowedReasons = AllowedReasons;

   public readonly reason = input.required<AllowedReasons | string>();

   constructor(
      private readonly routerService: RouterService
   ) {
      effect(() => {
         if(!Object.values(AllowedReasons).includes(this.reason() as any)) {
            this.routerService.navigate(RouteUrls.MENU);
         }
      }, { allowSignalWrites: true });
   }

   public toLogin(): void {
      this.routerService.navigate(RouteUrls.USER);
   }
}
