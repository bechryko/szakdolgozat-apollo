import { TestBed } from "@angular/core/testing";
import { Event, NavigationEnd, Router } from "@angular/router";
import { RouteUrls } from "@apollo/app.routes";
import { cold, hot } from "jasmine-marbles";
import { BehaviorSubject } from "rxjs";
import { RouterService } from "./router.service";

describe('RouterService', () => {
   let service: RouterService;
   let router: jasmine.SpyObj<Router>;
   let routerEvents$: BehaviorSubject<Event>;

   function routerFactory() {
      return {
         ...jasmine.createSpyObj("Router", ['navigateByUrl']),
         events: routerEvents$
      };
   }

   const navigationEndEvent = new NavigationEnd(1, '/testUrlAfterRedirects', '/testUrlAfterRedirects');

   beforeEach(() => {
      routerEvents$ = new BehaviorSubject<Event>(navigationEndEvent);

      TestBed.configureTestingModule({
         providers: [
            RouterService,
            {
               provide: Router,
               useFactory: routerFactory
            }
         ]
      });

      service = TestBed.inject(RouterService);
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
   });

   describe('currentPage$', () => {
      it("should emit the current page", () => {
         const expected = hot('a', { a: 'testUrlAfterRedirects' });

         expect(service.currentPage$).toBeObservable(expected);
      });

      it("should not emit the base of the current page", () => {
         const url = '/testUrlAfterRedirects/testSubUrl';
         routerEvents$.next(new NavigationEnd(1, url, url));

         const expected = cold('a', { a: 'testUrlAfterRedirects' });

         expect(service.currentPage$).toBeObservable(expected);
      });
   });

   describe('isAdminPage$', () => {
      it("should emit true if the current page is the admin page", () => {
         const url = "/" + RouteUrls.ADMINISTRATION;
         routerEvents$.next(new NavigationEnd(1, url, url));

         const expected = cold('a', { a: true });

         expect(service.isAdminPage$).toBeObservable(expected);
      });

      it("should emit true if the current page is a subpage of the admin page", () => {
         const url = "/" + RouteUrls.ADMINISTRATION + "/testSubpage";
         routerEvents$.next(new NavigationEnd(1, url, url));

         const expected = cold('a', { a: true });

         expect(service.isAdminPage$).toBeObservable(expected);
      });
      
      it("should emit false if the current page is not the admin page", () => {
         const expected = cold('a', { a: false });

         expect(service.isAdminPage$).toBeObservable(expected);
      });
   });
   
   describe('navigate', () => {
      it("should navigate to the specified page", () => {
         const page: any = "testUrl";
         service.navigate(page);

         expect(router.navigateByUrl).toHaveBeenCalledWith("testUrl");
      });
      
      it("should navigate to the specified subpage", () => {
         const page: any = "testUrl";
         const testParam1 = "testParam1";
         const testParam2 = "testParam2";
         service.navigate(page, testParam1, testParam2);

         expect(router.navigateByUrl).toHaveBeenCalledWith("testUrl/testParam1/testParam2");
      });
   });
});
