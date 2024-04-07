import { TestBed } from "@angular/core/testing";
import { UniversitySubject } from "@apollo/shared/models";
import { TranslocoService } from "@ngneat/transloco";
import { isEqual } from "lodash";
import { GetSubjectsPipe } from "./get-subjects.pipe";

describe('GetSubjectsPipe', () => {
   let pipe: GetSubjectsPipe;

   const testSubjects = [
      { code: "A", name: "Subject A" },
      { code: "B", name: "Subject B" },
      { code: "C", name: "Subject C" },
      { code: "D", name: "Subject D" }
   ] as UniversitySubject[];

   const missingSubjectName = "x Missing Subject Name";
   function translocoServiceFactory(): jasmine.SpyObj<TranslocoService> {
      return {
         ...jasmine.createSpyObj('TranslocoService', ['']),
         translate: () => missingSubjectName
      };
   }
   
   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            {
               provide: TranslocoService,
               useFactory: translocoServiceFactory
            }
         ]
      });

      pipe = new GetSubjectsPipe(TestBed.inject(TranslocoService));
   });

   it("should return the corresponding subjects when a subject code array is provided", () => {
      const codes = [ "A", "C" ];

      const expected = [
         { code: "A", name: "Subject A" },
         { code: "C", name: "Subject C" }
      ] as UniversitySubject[];

      expect(pipe.transform(codes, testSubjects)).toEqual(expected);
   });

   it("should return the corresponding subjects when a subject array is provided", () => {
      const subjects = [
         { code: "B", name: "test B" },
         { code: "D", name: "test D" }
      ] as UniversitySubject[];

      const expected = [
         { code: "B", name: "Subject B" },
         { code: "D", name: "Subject D" }
      ] as UniversitySubject[];

      expect(pipe.transform(subjects, testSubjects)).toEqual(expected);
   });

   it("should return a missing subject when a subject code cannot be found in the source array", () => {
      const codes = [ "A", "E" ];

      const expected = [
         { code: "A", name: "Subject A" },
         { code: "E", name: missingSubjectName }
      ] as UniversitySubject[];

      expect(pipe.transform(codes, testSubjects)).toEqual(expected);
   });

   it("should return the corresponding subjects in alphabetical order", () => {
      const codes = [ "D", "B", "C", "A" ];

      const result = pipe.transform(codes, testSubjects);
      expect(isEqual(result, result.sort((a, b) => a.name.localeCompare(b.name)))).toBeTrue();
   });
});
