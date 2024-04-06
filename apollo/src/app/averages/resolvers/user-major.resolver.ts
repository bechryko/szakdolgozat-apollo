import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { UniversityMajor } from "@apollo/shared/models";
import { UniversitiesService, UserService } from "@apollo/shared/services";
import { catchError, map, of, switchMap } from "rxjs";

export const userMajorResolver: ResolveFn<UniversityMajor | null> = () => {
   const userService = inject(UserService);
   const universitiesService = inject(UniversitiesService);

   return userService.user$.pipe(
      switchMap(user => {
         if (!user?.major) {
            return of(null);
         }

         return universitiesService.getMajor(user.major).pipe(
            map(major => major || null),
            catchError(() => {
               // TODO: error handling
               return of(null);
            })
         );
      }),
   );
};
