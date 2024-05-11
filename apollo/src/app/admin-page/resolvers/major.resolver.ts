import { Location } from "@angular/common";
import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { UniversityMajor } from "@apollo/shared/models";
import { UniversitiesService } from "@apollo/shared/services";
import { filter, map, switchMap } from "rxjs";
import { universityResolver } from "./university.resolver";

export const majorResolver: ResolveFn<UniversityMajor> = route => {
   const universitiesService = inject(UniversitiesService);
   const location = inject(Location);

   return universityResolver(route).pipe(
      switchMap(university => universitiesService.getMajorsForUniversity(university.id)),
      map(majors => majors.find(major => major.id === route.paramMap.get('majorId'))),
      filter((major): major is UniversityMajor => {
         if(!major) {
            location.back();
         }

         return Boolean(major);
      })
   );
};
