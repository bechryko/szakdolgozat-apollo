import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { Observable, distinctUntilChanged, filter, map } from 'rxjs';
import { multicast } from '../operators';

@Injectable({
   providedIn: 'root'
})
export class RouterService {
   public readonly currentPage$: Observable<RouteUrls>;
   public readonly isAdminPage$: Observable<boolean>;
   public readonly routeParams$: Observable<ParamMap>;

   constructor(
      private readonly router: Router,
      private readonly activatedRoute: ActivatedRoute
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

      this.routeParams$ = this.activatedRoute.queryParamMap.pipe(
         multicast(),
         distinctUntilChanged()
      );
   }

   public navigate(page: RouteUrls, queryParams?: { [key: string]: string }): void {
      this.router.navigate(["/" + page], { queryParams });
   }

   public getRouteParam(paramKey: string): Observable<string | null> {
      return this.routeParams$.pipe(
         map(params => params.get(paramKey)),
         distinctUntilChanged()
      );
   }
}
