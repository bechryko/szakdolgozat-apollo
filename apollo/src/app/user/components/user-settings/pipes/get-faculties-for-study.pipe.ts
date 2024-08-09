import { Pipe, PipeTransform } from '@angular/core';
import { ApolloUserStudy, University, UniversityFaculty } from '@apollo/shared/models';

@Pipe({
   name: 'getFacultiesForStudy',
   standalone: true
})
export class GetFacultiesForStudyPipe implements PipeTransform {
   public transform(study: ApolloUserStudy, universities: University[]): UniversityFaculty[] {
      return universities.find(university => university.id === study.university)?.faculties ?? [];
   }
}
