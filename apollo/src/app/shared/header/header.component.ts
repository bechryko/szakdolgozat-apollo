import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import { Observable, map } from 'rxjs';
import { RouteUrls } from '../../app.routes';
import { UserService } from '../services';

type RouteUrl = keyof typeof RouteUrls;

@Component({
   selector: 'apo-header',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatButtonModule,
      MatIconModule,
      AsyncPipe
   ],
   templateUrl: './header.component.html',
   styleUrl: './header.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
   public readonly isUserLoggedIn$: Observable<boolean>;
   public readonly menuItemKeys$: Observable<RouteUrl[]>;
   public selectedMenu: WritableSignal<RouteUrl>;

   constructor(
      private readonly router: Router,
      private readonly userService: UserService
   ) {
      this.isUserLoggedIn$ = this.userService.isUserLoggedIn$;

      this.menuItemKeys$ = this.userService.isUserAdmin$.pipe(
         map(isAdmin => {
            const menuItemKeys: RouteUrl[] = [
               'AVERAGES',
               'MAJOR_COMPLETION',
               'TIMETABLE'
            ];

            if(isAdmin) {
               menuItemKeys.push('ADMINISTRATION');
            }

            return menuItemKeys;
         })
      );

      this.selectedMenu = signal('MENU');

      effect(() => {
         this.router.navigateByUrl("/" + RouteUrls[this.selectedMenu()]);
      });
   }

   public selectMenuItem(route: RouteUrl): void {
      this.selectedMenu.set(route);
   }
}
