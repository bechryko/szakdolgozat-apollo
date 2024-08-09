import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map, of, switchMap } from "rxjs";
import { UniversityMajor } from "../models";
import { UniversitiesService, UserService } from "../services";

export const userMajorResolver: ResolveFn<UniversityMajor | null> = () => {
   const userService = inject(UserService);
   const universitiesService = inject(UniversitiesService);

   return userService.selectedStudy$.pipe(
      switchMap(study => {
         if (!study?.major) {
            return of(null);
         }

         return universitiesService.getMajor(study.major).pipe(
            map(major => major || null)
         );
      }),
   );
};
