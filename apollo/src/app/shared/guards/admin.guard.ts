import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { take, tap } from 'rxjs';
import { AllowedReasons } from '../components';
import { RouterService, UserService } from '../services';

export const adminGuard: CanActivateFn = () => {
   const userService = inject(UserService);
   const routerService = inject(RouterService);

   return userService.isUserAdmin$.pipe(
      take(1),
      tap(isAdmin => {
         if (!isAdmin) {
            routerService.navigate(RouteUrls.NO_ACCESS, AllowedReasons.NOT_ADMIN);
         }
      })
   );
};
