import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { map } from 'rxjs';
import { RouteUrls } from './app.routes';
import { HeaderComponent } from './shared/header';
import { LoadingService } from './shared/loading';
import { ApolloCommonModule } from './shared/modules';
import { registerCatchAndNotifyErrorOperator } from './shared/operators/catch-and-notify-error';
import { RouterService, SnackBarService } from './shared/services';
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
   private readonly sidebarExceptionRoutes = [
      RouteUrls.ADMINISTRATION,
      RouteUrls.ADMIN_MAJOR,
      RouteUrls.ADMIN_UNIVERSITY,
      RouteUrls.TIMETABLE
   ];

   public readonly isAdminPage: Signal<boolean | undefined>;
   public readonly enableMainPadding: Signal<boolean | undefined>;
   public readonly isSidebarShown: Signal<boolean | undefined>;

   public readonly loadingOverlayConfig = this.loadingService.config;

   constructor(
      private readonly routerService: RouterService,
      private readonly loadingService: LoadingService,
      private readonly snackbarService: SnackBarService
   ) {
      registerCatchAndNotifyErrorOperator(this.loadingService, this.snackbarService);

      this.isAdminPage = toSignal(this.routerService.isAdminPage$.pipe(
         takeUntilDestroyed()
      ));

      this.enableMainPadding = toSignal(this.routerService.currentPage$.pipe(
         takeUntilDestroyed(),
         map(page => page !== RouteUrls.TIMETABLE)
      ));

      this.isSidebarShown = toSignal(this.routerService.currentPage$.pipe(
         takeUntilDestroyed(),
         map(page => !this.sidebarExceptionRoutes.includes(page))
      ));
   }
}
