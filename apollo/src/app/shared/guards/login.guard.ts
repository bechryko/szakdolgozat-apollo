import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { take, tap } from 'rxjs';
import { AllowedReasons } from '../components';
import { RouterService, UserService } from '../services';

export const loginGuard: CanActivateFn = () => {
   const userService = inject(UserService);
   const routerService = inject(RouterService);

   return userService.isUserLoggedIn$.pipe(
      take(1),
      tap(isLoggedIn => {
         if(!isLoggedIn) {
            routerService.navigate(RouteUrls.NO_ACCESS, AllowedReasons.NOT_LOGGED_IN);
         }
      })
   );
};
