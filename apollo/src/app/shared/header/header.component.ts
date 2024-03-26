import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteUrls } from '@apollo/app.routes';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { Observable, map } from 'rxjs';
import { RouterService, UserService } from '../services';

@Component({
   selector: 'apo-header',
   standalone: true,
   imports: [
      TranslocoPipe,
      NgLetModule,
      MatButtonModule,
      MatIconModule,
      AsyncPipe
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
      this.isUserLoggedIn$ = this.userService.isUserLoggedIn$;

      this.menuItemKeys$ = this.userService.isUserAdmin$.pipe(
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

      this.selectedMenu$ = this.routerService.currentPage$;
   }

   public selectMenuItem(route: RouteUrls): void {
      this.routerService.navigate(route);
   }
}
