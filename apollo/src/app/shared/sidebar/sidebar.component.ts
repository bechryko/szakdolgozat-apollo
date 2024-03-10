import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, interval, map } from 'rxjs';
import { TimeFormatService } from '../services';

@Component({
   selector: 'apo-sidebar',
   standalone: true,
   imports: [
      CommonModule
   ],
   providers: [
      {
         provide: DATE_PIPE_DEFAULT_OPTIONS,
         useValue: {
            dateFormat: "medium"
         }
      }
   ],
   templateUrl: './sidebar.component.html',
   styleUrl: './sidebar.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
   public readonly currentTime$: Observable<[string, string]>;

   constructor(
      private readonly timeFormatService: TimeFormatService
   ) {
      this.currentTime$ = interval(100).pipe(
         map(() => this.timeFormatService.format(new Date()))
      );
   }
}
