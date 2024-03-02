import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MultiLanguagePipe } from '@apollo-shared/pipes';
import { Observable, of } from 'rxjs';
import { MenuCard } from './models';

@Component({
   selector: 'apo-menu',
   standalone: true,
   imports: [
      CommonModule,
      MatCardModule,
      MultiLanguagePipe
   ],
   templateUrl: './menu.component.html',
   styleUrl: './menu.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
   public readonly cards$: Observable<MenuCard[]>;

   constructor() {
      this.cards$ = of([]);
   }
}
