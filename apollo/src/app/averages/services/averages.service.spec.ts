import { TestBed } from "@angular/core/testing";
import { UniversityCompletionYear } from "@apollo/shared/models";
import { CompletionsService } from "@apollo/shared/services";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { getTestScheduler, hot } from "jasmine-marbles";
import { AlternativeSemester, GradesCompletionYear } from "../models";
import { averagesActions } from "../store";
import { AveragesService } from "./averages.service";

describe('AveragesService', () => {
   let service: AveragesService;
   let store: MockStore;
   let dispatchSpy: jasmine.Spy;

   const universityCompletions: UniversityCompletionYear[] = [
      {
         id: '1',
         name: '2019/2020',
         owner: 'testOwner',
         firstSemester: [
            {
               name: 'testSubject1',
               rating: 5,
               credit: 2
            }
         ],
         secondSemester: [
            {
               name: 'testSubject2',
               rating: 3,
               credit: 3
            }
         ]
      }
   ];

   function completionsServiceFactory() {
      return jasmine.createSpyObj('CompletionsService', [], {
         universityCompletions$: hot('a', { a: universityCompletions })
      });
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            AveragesService,
            provideMockStore({
               initialState: {
                  averages: {
                     alternativeSemesters: []
                  }
               }
            }),
            {
               provide: CompletionsService,
               useFactory: completionsServiceFactory
            }
         ]
      });

      service = TestBed.inject(AveragesService);
      store = TestBed.inject(MockStore);
      dispatchSpy = spyOn(store, 'dispatch');
   });

   describe('grades$', () => {
      it('should map university completions to grades completions', () => {
         const expectedGrades: GradesCompletionYear[] = [
            {
               id: '1',
               name: '2019/2020',
               owner: 'testOwner',
               firstSemesterGrades: [
                  {
                     name: 'testSubject1',
                     rating: 5,
                     credit: 2
                  }
               ],
               secondSemesterGrades: [
                  {
                     name: 'testSubject2',
                     rating: 3,
                     credit: 3
                  }
               ]
            }
         ];

         expect(service.grades$).toBeObservable(hot('a', { a: expectedGrades }));
      });

      it('should map alternative semesters to grades completions', () => {
         const alternativeSemesters: AlternativeSemester[] = [
            {
               id: '1',
               type: 'firstSemesterGrades',
               original: [
                  {
                     name: 'testSubject1',
                     rating: 5,
                     credit: 2
                  }
               ],
               grades: [
                  {
                     name: 'testSubject1',
                     rating: 4,
                     credit: 2
                  }
               ]
            }
         ];
         const expectedGrades: GradesCompletionYear[] = [
            {
               id: '1',
               name: '2019/2020',
               owner: 'testOwner',
               firstSemesterGrades: [
                  {
                     name: 'testSubject1',
                     rating: 5,
                     credit: 2
                  }
               ],
               secondSemesterGrades: [
                  {
                     name: 'testSubject2',
                     rating: 3,
                     credit: 3
                  }
               ],
               alternativeGrades: {
                  firstSemester: [
                     {
                        name: 'testSubject1',
                        rating: 4,
                        credit: 2
                     }
                  ]
               }
            }
         ];
         store.setState({
            averages: { alternativeSemesters }
         });

         expect(service.grades$).toBeObservable(hot('a', { a: expectedGrades }));
      });

      it(`should dispatch ${ averagesActions.removeAlternativeSemester.type } if the semester was changed`, () => {
         const alternativeSemesters: AlternativeSemester[] = [
            {
               id: '1',
               type: 'firstSemesterGrades',
               original: [
                  {
                     name: 'testSubject1',
                     rating: 3,
                     credit: 2
                  }
               ],
               grades: [
                  {
                     name: 'testSubject1',
                     rating: 4,
                     credit: 2
                  }
               ]
            }
         ];
         store.setState({
            averages: { alternativeSemesters }
         });

         service.grades$.subscribe();
         getTestScheduler().flush();

         expect(dispatchSpy).toHaveBeenCalledWith(averagesActions.removeAlternativeSemester({
            id: '1',
            semesterType: 'firstSemesterGrades'
         }));
      });
   });
});
