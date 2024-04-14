import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HeaderComponent } from './shared/header';
import { LanguageService } from './shared/languages';
import { LoadingService } from './shared/loading';
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
      SidebarComponent,
      NgxSpinnerModule
   ],
   schemas: [
      CUSTOM_ELEMENTS_SCHEMA
   ],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
   public readonly isAdminPage: Signal<boolean | undefined>;

   public readonly loadingOverlayConfig = this.loadingService.config;

   constructor(
      private readonly languageService: LanguageService,
      private readonly routerService: RouterService,
      private readonly loadingService: LoadingService
   ) {
      this.languageService.setInitialLanguage();

      this.isAdminPage = toSignal(this.routerService.isAdminPage$);
   }
}
