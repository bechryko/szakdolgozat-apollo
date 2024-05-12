import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { concat } from 'lodash';
import { Observable, combineLatest, map } from 'rxjs';
import { MenuCard } from './models';
import { MenuCardsService } from './services';

@Component({
   selector: 'apo-menu',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatCardModule,
      MultiLanguagePipe
   ],
   templateUrl: './menu.component.html',
   styleUrl: './menu.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
   public readonly cards$: Observable<MenuCard[]>;

   constructor(
      private readonly menuCardsService: MenuCardsService
   ) {
      this.cards$ = combineLatest([
         this.menuCardsService.fixedCards$,
         this.menuCardsService.shuffledCards$
      ]).pipe(
         takeUntilDestroyed(),
         map(([fixedCards, shuffledCards]) => concat(fixedCards, shuffledCards))
      );
   }

   public openUrl(url: string): void {
      window.open(url, '_blank');
   }
}
