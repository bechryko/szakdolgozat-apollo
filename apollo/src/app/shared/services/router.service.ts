import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { isEqual } from 'lodash';
import { Observable, distinctUntilChanged, filter, map } from 'rxjs';
import { LoadingService, LoadingType, navigationLoadingKey } from '../loading';
import { multicast } from '../operators';

@Injectable({
   providedIn: 'root'
})
export class RouterService {
   public readonly currentPage$: Observable<RouteUrls>;
   public readonly isAdminPage$: Observable<boolean>;

   private readonly routerEvents$ = this.router.events.pipe(
      takeUntilDestroyed(),
      multicast(),
      distinctUntilChanged(isEqual)
   );

   constructor(
      private readonly router: Router,
      private readonly loadingService: LoadingService
   ) {
      this.routerEvents$.subscribe(event => {
         if(event instanceof NavigationStart) {
            this.loadingService.startLoading(navigationLoadingKey, LoadingType.NAVIGATION, false);
         } else if(event instanceof NavigationEnd) {
            this.loadingService.finishLoading(navigationLoadingKey);
         }
      });

      this.currentPage$ = this.router.events.pipe(
         filter((event): event is NavigationEnd => event instanceof NavigationEnd),
         map(event => event.urlAfterRedirects.split('/')[1] as RouteUrls),
         multicast(),
         distinctUntilChanged()
      );

      this.isAdminPage$ = this.currentPage$.pipe(
         map(page => page === RouteUrls.ADMINISTRATION),
         multicast(),
         distinctUntilChanged()
      );
   }

   public navigate(page: RouteUrls, ...params: string[]): void {
      this.router.navigateByUrl([page, ...params].join('/'));
   }
}
