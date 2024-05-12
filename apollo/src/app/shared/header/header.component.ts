import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouteUrls } from '@apollo/app.routes';
import { Observable, map, startWith } from 'rxjs';
import { ApolloCommonModule } from '../modules';
import { RouterService, UserService } from '../services';

@Component({
   selector: 'apo-header',
   standalone: true,
   imports: [
      ApolloCommonModule
   ],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
   public readonly routeUrls = RouteUrls;
   public readonly routeUrlToTranslationKeyMap = Object.entries(RouteUrls).reduce((acc, [key, value]) => {
      acc[value as any] = 'NAVIGATION.' + key;
      return acc;
   }, {} as any);

   public readonly isUserLoggedIn$: Observable<boolean>;
   public readonly menuItemKeys$: Observable<RouteUrls[]>;
   public readonly selectedMenu$: Observable<RouteUrls>;

   constructor(
      private readonly routerService: RouterService,
      private readonly userService: UserService
   ) {
      this.isUserLoggedIn$ = this.userService.isUserLoggedIn$.pipe(
         takeUntilDestroyed()
      );

      this.menuItemKeys$ = this.userService.isUserAdmin$.pipe(
         takeUntilDestroyed(),
         startWith(false),
         map(isAdmin => {
            const menuItemKeys: RouteUrls[] = [
               RouteUrls.AVERAGES,
               RouteUrls.MAJOR_COMPLETION,
               RouteUrls.TIMETABLE
            ];

            if(isAdmin) {
               menuItemKeys.push(RouteUrls.ADMINISTRATION);
            }

            return menuItemKeys;
         })
      );

      this.selectedMenu$ = this.routerService.currentPage$.pipe(
         takeUntilDestroyed()
      );
   }

   public selectMenuItem(route: RouteUrls): void {
      this.routerService.navigate(route);
   }
}
