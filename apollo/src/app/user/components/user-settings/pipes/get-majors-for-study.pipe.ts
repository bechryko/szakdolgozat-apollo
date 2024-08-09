import { Pipe, PipeTransform } from '@angular/core';
import { ApolloUserStudy, UniversityMajor } from '@apollo/shared/models';
import { UniversitiesService } from '@apollo/shared/services';
import { map, Observable, of, take } from 'rxjs';

@Pipe({
   name: 'getMajorsForStudy',
   standalone: true
})
export class GetMajorsForStudyPipe implements PipeTransform {
   constructor(private readonly universitiesService: UniversitiesService) { }

   public transform(study: ApolloUserStudy): Observable<UniversityMajor[]> {
      if(!study.university) {
         return of([]);
      }

      return this.universitiesService.getMajorsForUniversity(study.university).pipe(
         take(1),
         map(majors => majors.filter(major => major.facultyId === study.faculty))
      );
   }
}
