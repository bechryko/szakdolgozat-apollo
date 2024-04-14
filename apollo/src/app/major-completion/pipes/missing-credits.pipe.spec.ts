import { UniversityCompletionYear, UniversityMajor, UniversityMajorSubjectGroup, UniversitySpecializationSubjectGroup } from "@apollo/shared/models";
import { MissingCreditsPipe } from "./missing-credits.pipe";

describe('MissingCreditsPipe', () => {
   let pipe: MissingCreditsPipe;

   const completions = [
      {
         firstSemester: [
            { code: '1', credit: 3 },
            { code: '2', credit: 3 }
         ],
         secondSemester: [
            { code: '4', credit: 3 },
            { code: '5', credit: 3 }
         ],
      }
   ] as UniversityCompletionYear[];

   beforeEach(() => {
      pipe = new MissingCreditsPipe();
   });

   describe('transformMajorSubjectGroup', () => {
      it("should transform correctly when there are no completed credits", () => {
         const group = {
            creditRequirement: 10,
            subjects: [
               { code: '11' },
               { code: '12' },
               { code: '13' },
               { code: '14' }
            ]
         } as UniversityMajorSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(10);
      });

      it("should transform correctly when there are some completed credits", () => {
         const group = {
            creditRequirement: 10,
            subjects: [
               { code: '1' },
               { code: '2' },
               { code: '13' },
               { code: '14' }
            ]
         } as UniversityMajorSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(4);
      });

      it("should transform correctly when the group is completed", () => {
         const group = {
            creditRequirement: 10,
            subjects: [
               { code: '1' },
               { code: '2' },
               { code: '4' },
               { code: '5' }
            ]
         } as UniversityMajorSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(0);
      });
   });

   describe('transformSpecializationGroup', () => {
      it("should transform correctly when there are no completed credits", () => {
         const group = {
            creditRequirement: 10,
            subGroups: [
               {
                  subjects: [
                     { code: '11' },
                     { code: '12' }
                  ]
               },
               {
                  subjects: [
                     { code: '13' },
                     { code: '14' }
                  ]
               }
            ]
         } as UniversitySpecializationSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(10);
      });

      it("should transform correctly when there are some completed credits", () => {
         const group = {
            creditRequirement: 10,
            subGroups: [
               {
                  subjects: [
                     { code: '1' },
                     { code: '2' }
                  ]
               },
               {
                  subjects: [
                     { code: '13' },
                     { code: '4' }
                  ]
               }
            ]
         } as UniversitySpecializationSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(1);
      });

      it("should transform correctly when the group is completed", () => {
         const group = {
            creditRequirement: 10,
            subGroups: [
               {
                  subjects: [
                     { code: '1' },
                     { code: '2' },
                     { code: '4' }
                  ]
               },
               {
                  subjects: [
                     { code: '5' }
                  ]
               }
            ]
         } as UniversitySpecializationSubjectGroup;

         const result = pipe.transform(group, completions);

         expect(result).toBe(0);
      });
   });

   describe('transformMajor', () => {
      it("should transform correctly when there are no completed credits", () => {
         const major = {
            creditRequirement: 10,
            subjectGroups: [
               {
                  subjects: [
                     { code: '11' },
                     { code: '12' }
                  ]
               },
               {
                  subjects: [
                     { code: '13' },
                     { code: '14' }
                  ]
               }
            ]
         } as UniversityMajor;

         const result = pipe.transform(major, completions);

         expect(result).toBe(10);
      });

      it("should transform correctly when there are some completed credits", () => {
         const major = {
            creditRequirement: 10,
            subjectGroups: [
               {
                  subjects: [
                     { code: '11' },
                     { code: '2' }
                  ]
               },
               {
                  subjects: [
                     { code: '4' },
                     { code: '5' }
                  ]
               }
            ]
         } as UniversityMajor;

         const result = pipe.transform(major, completions);

         expect(result).toBe(1);
      });

      it("should transform correctly when the group is completed", () => {
         const major = {
            creditRequirement: 10,
            subjectGroups: [
               {
                  subjects: [
                     { code: '1' }
                  ]
               },
               {
                  subjects: [
                     { code: '2' },
                     { code: '4' },
                     { code: '5' }
                  ]
               }
            ]
         } as UniversityMajor;

         const result = pipe.transform(major, completions);

         expect(result).toBe(0);
      });
   });
});
