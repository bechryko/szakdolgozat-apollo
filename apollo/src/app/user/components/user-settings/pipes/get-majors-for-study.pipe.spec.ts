import { TestBed } from "@angular/core/testing";
import { ApolloUserStudy, UniversityMajor } from "@apollo/shared/models";
import { UniversitiesService } from "@apollo/shared/services";
import { cold } from "jasmine-marbles";
import { of } from "rxjs";
import { GetMajorsForStudyPipe } from "./get-majors-for-study.pipe";

describe('GetMajorsForStudyPipe', () => {
   let pipe: GetMajorsForStudyPipe;

   const majors = [
      {
         id: "1",
         facultyId: 1
      },
      {
         id: "2",
         facultyId: 1
      },
      {
         id: "3",
         facultyId: 2
      }
   ] as UniversityMajor[];

   const study = {
      university: "1",
      faculty: 1
   } as ApolloUserStudy;

   function universitiesServiceFactory() {
      const service = jasmine.createSpyObj('UniversitiesService', ['getMajorsForUniversity']) as jasmine.SpyObj<UniversitiesService>;
      service.getMajorsForUniversity.and.returnValue(of(majors));
      return service;
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            {
               provide: UniversitiesService,
               useFactory: universitiesServiceFactory
            }
         ]
      });

      pipe = new GetMajorsForStudyPipe(TestBed.inject(UniversitiesService));
   });

   it("should return the majors for the study's faculty", () => {
      const expected = cold('(a|)', { a:  [majors[0], majors[1] ] });

      expect(pipe.transform(study)).toBeObservable(expected);
   });

   it("should return an empty array if the study's faculty has no majors", () => {
      const studyWithoutMajors = {
         ...study,
         faculty: 3
      } as ApolloUserStudy;

      const expected = cold('(a|)', { a: [] });

      expect(pipe.transform(studyWithoutMajors)).toBeObservable(expected);
   });

   it("should return an empty array if the study has no university", () => {
      const studyWithoutUniversity = {
         ...study,
         university: undefined
      } as ApolloUserStudy;

      const expected = cold('(a|)', { a: [] });

      expect(pipe.transform(studyWithoutUniversity)).toBeObservable(expected);
   });

   it("should return an empty array if the study has no faculty", () => {
      const studyWithoutFaculty = {
         ...study,
         faculty: undefined
      } as ApolloUserStudy;

      const expected = cold('(a|)', { a: [] });

      expect(pipe.transform(studyWithoutFaculty)).toBeObservable(expected);
   });
});
