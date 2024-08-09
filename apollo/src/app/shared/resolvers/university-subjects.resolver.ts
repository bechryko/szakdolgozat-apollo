import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { of, switchMap } from "rxjs";
import { UniversitySubject } from "../models";
import { UniversitiesService, UserService } from "../services";

export const universitySubjectsResolver: ResolveFn<UniversitySubject[]> = () => {
   const userService = inject(UserService);
   const universitiesService = inject(UniversitiesService);

   return userService.selectedStudy$.pipe(
      switchMap(study => {
         if(!study?.university) {
            return of([]);
         }

         return universitiesService.getSubjectsForUniversity(study.university);
      })
   )
};
