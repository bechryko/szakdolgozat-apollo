import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { Observable, distinctUntilChanged, filter, map } from 'rxjs';
import { multicast } from '../operators';

@Injectable({
   providedIn: 'root'
})
export class RouterService {
   public readonly currentPage$: Observable<RouteUrls>;
   public readonly isAdminPage$: Observable<boolean>;

   constructor(
      private readonly router: Router
   ) {
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
