import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import { RouteUrls } from '../../app.routes';

@Component({
   selector: 'apo-header',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatButtonModule
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

   constructor(
      private readonly router: Router
   ) { }

   public navigateTo(route: typeof this.menuItemKeys[number]): void {
      this.router.navigateByUrl("/" + RouteUrls[route]);
   }
}
