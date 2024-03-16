import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import { Observable, map } from 'rxjs';
import { RouteUrls } from '../../app.routes';
import { UserService } from '../services';

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
   public readonly menuItemKeys = [
      'AVERAGES',
      'MAJOR_COMPLETION',
      'TIMETABLE'
   ] as const;
   public readonly isUserLoggedIn$: Observable<boolean>;

   constructor(
      private readonly router: Router,
      private readonly userService: UserService
   ) {
      this.isUserLoggedIn$ = this.userService.user$.pipe(
         map(Boolean)
      );
   }

   public navigateTo(route: typeof this.menuItemKeys[number] | 'MENU' | 'USER'): void {
      this.router.navigateByUrl("/" + RouteUrls[route]);
   }
}
