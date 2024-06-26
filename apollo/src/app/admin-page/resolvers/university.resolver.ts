import { Location } from "@angular/common";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { University } from "@apollo/shared/models";
import { UniversitiesService } from "@apollo/shared/services";
import { Observable, filter, map } from "rxjs";
import { universityRouteParam } from "../constants";

export function universityResolver(route: ActivatedRouteSnapshot): Observable<University> {
   const universitiesService = inject(UniversitiesService);
   const location = inject(Location);

   return universitiesService.universities$.pipe(
      map(universities => universities.find(university => university.id === route.paramMap.get(universityRouteParam))),
      filter((university): university is University => {
         if(!university) {
            location.back();
         }

         return Boolean(university);
      })
   );
};
