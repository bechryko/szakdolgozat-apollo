import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { UniversityMajor } from "@apollo/shared/models";
import { UniversitiesService } from "@apollo/shared/services";
import { filter, map, switchMap } from "rxjs";
import { universityResolver } from "./university.resolver";

export const majorResolver: ResolveFn<UniversityMajor> = route => {
   const universitiesService = inject(UniversitiesService);

   return universityResolver(route).pipe(
      switchMap(university => universitiesService.getMajorsForUniversity(university.id)),
      map(majors => majors.find(major => major.id === route.paramMap.get('majorId'))),
      filter(Boolean)
   );
};
