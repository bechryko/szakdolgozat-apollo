import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map, of, switchMap } from "rxjs";
import { UniversityMajor } from "../models";
import { UniversitiesService, UserService } from "../services";

export const userMajorResolver: ResolveFn<UniversityMajor | null> = () => {
   const userService = inject(UserService);
   const universitiesService = inject(UniversitiesService);

   return userService.user$.pipe(
      switchMap(user => {
         if (!user?.major) {
            return of(null);
         }

         return universitiesService.getMajor(user.major).pipe(
            map(major => major || null)
         );
      }),
   );
};
