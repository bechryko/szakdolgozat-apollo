import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header';
import { LanguageService } from './shared/languages';
import { ApolloCommonModule } from './shared/modules';
import { RouterService } from './shared/services';
import { SidebarComponent } from './shared/sidebar';

@Component({
   selector: 'apo-root',
   standalone: true,
   imports: [
      ApolloCommonModule,
      RouterOutlet,
      HeaderComponent,
      SidebarComponent
   ],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
   public readonly isAdminPage: Signal<boolean | undefined>;

   constructor(
      private readonly languageService: LanguageService,
      private readonly routerService: RouterService
   ) {
      this.languageService.setInitialLanguage();

      this.isAdminPage = toSignal(this.routerService.isAdminPage$);
   }
}
