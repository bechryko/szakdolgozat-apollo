import { ApolloUserStudy, University } from '@apollo/shared/models';
import { GetFacultiesForStudyPipe } from './get-faculties-for-study.pipe';

describe('GetFacultiesForUniversityPipe', () => {
   let pipe: GetFacultiesForStudyPipe;

   const universities = [
      {
         id: '1',
         faculties: [
            { id: 1 },
            { id: 2 }
         ]
      },
      {
         id: '2',
         faculties: [
            { id: 3 },
            { id: 4 }
         ]
      }
   ] as University[];

   const study = {
      university: '1',
      faculty: 1
   } as ApolloUserStudy;

   beforeEach(() => {
      pipe = new GetFacultiesForStudyPipe();
   });

   it("should return the faculties for the university", () => {
      expect(pipe.transform(study, universities)).toEqual([
         { id: 1 },
         { id: 2 }
      ]);
   });

   it("should return an empty array if the university is not found", () => {
      const modifiedStudy = {
         ...study,
         university: '3'
      };

      expect(pipe.transform(modifiedStudy, universities)).toEqual([]);
   });

   it("should return an empty array if the study has no university selected", () => {
      expect(pipe.transform({}, universities)).toEqual([]);
   });
});
