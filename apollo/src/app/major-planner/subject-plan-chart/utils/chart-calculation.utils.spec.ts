import { MajorPlan, SubjectGroupingMode } from "@apollo/major-planner/models";
import { UniversitySubject } from "@apollo/shared/models";
import { cloneDeep } from "lodash";
import { ChartCalculationUtils } from "./chart-calculation.utils";

fdescribe('ChartCalculationUtils', () => {
   const majorPlan = {
      name: "Test Plan",
      semesters: [
         {
            subjects: [
               {
                  id: '1',
                  name: 'Subject 1',
                  credit: 3,
                  code: 'SUB1'
               },
               {
                  id: '2',
                  name: 'Subject 2',
                  credit: 4,
                  code: 'SUB2',
                  parallelConditions: ['SUB1']
               }
            ]
         },
         {
            subjects: [
               {
                  id: '3',
                  name: 'Subject 3',
                  credit: 2,
                  code: 'SUB3',
                  preconditions: ['SUB1']
               },
               {
                  id: '4',
                  name: 'Subject 4',
                  credit: 3,
                  code: 'SUB4'
               }
            ]
         },
         {
            subjects: [
               {
                  id: '5',
                  name: 'Subject 5',
                  credit: 8,
                  code: 'SUB5',
                  preconditions: ['SUB4']
               }
            ]
         }
      ]
   } as MajorPlan;

   describe('getSubjectConditionMap', () => {
      it("should correctly return the subject condition map", () => {
         const expected = {
            'SUB1': {
               previous: [],
               next: ['SUB3'],
               parallel: [],
               parallelBy: ['SUB2']
            },
            'SUB2': {
               previous: [],
               next: [],
               parallel: ['SUB1'],
               parallelBy: []
            },
            'SUB3': {
               previous: ['SUB1'],
               next: [],
               parallel: [],
               parallelBy: []
            },
            'SUB4': {
               previous: [],
               next: ['SUB5'],
               parallel: [],
               parallelBy: []
            },
            'SUB5': {
               previous: ['SUB4'],
               next: [],
               parallel: [],
               parallelBy: []
            }
         };

         expect(ChartCalculationUtils.getSubjectConditionMap(majorPlan)).toEqual(expected);
      });
   });

   describe('calculateSubjectPositions', () => {
      describe('should calculate strict order positioning', () => {
         it("when there are no subject conditions", () => {
            const majorPlan = {
               semesters: [
                  {
                     subjects: [
                        { code: 'SUB1' },
                        { code: 'SUB2' }
                     ]
                  },
                  {
                     subjects: [
                        { code: 'SUB3' },
                        { code: 'SUB4' }
                     ]
                  }
               ]
            } as MajorPlan;

            const expected = {
               'SUB1': 0,
               'SUB2': 1,
               'SUB3': 0,
               'SUB4': 1
            };

            expect(ChartCalculationUtils.calculateSubjectPositions(
               majorPlan,
               SubjectGroupingMode.STRICT_ORDER,
               ChartCalculationUtils.getSubjectConditionMap(majorPlan)
            )).toEqual(expected);
         });

         it("when there are subject conditions", () => {
            const expected = {
               'SUB1': 0,
               'SUB2': 1,
               'SUB3': 0,
               'SUB4': 1,
               'SUB5': 0
            };

            expect(ChartCalculationUtils.calculateSubjectPositions(
               majorPlan,
               SubjectGroupingMode.STRICT_ORDER,
               ChartCalculationUtils.getSubjectConditionMap(majorPlan)
            )).toEqual(expected);
         });
      });

      fdescribe('should calculate full grouping positioning', () => {
         it("when there are only groups of subjects", () => {
            const expected = {
               'SUB1': 0,
               'SUB2': 1,
               'SUB3': 0,
               'SUB4': 2,
               'SUB5': 2
            };

            expect(ChartCalculationUtils.calculateSubjectPositions(
               majorPlan,
               SubjectGroupingMode.FULL_GROUPING,
               ChartCalculationUtils.getSubjectConditionMap(majorPlan)
            )).toEqual(expected);
         });

         it("when there are groups and individual subjects", () => {
            const majorPlanWithIndividualSubjects = cloneDeep(majorPlan);
            majorPlanWithIndividualSubjects.semesters[0].subjects.push({
               id: '6',
               name: 'Subject 6',
               credit: 1,
               code: 'SUB6'
            } as UniversitySubject);

            const expected = {
               'SUB1': 0,
               'SUB2': 1,
               'SUB3': 0,
               'SUB4': 2,
               'SUB5': 2,
               'SUB6': 3
            };

            expect(ChartCalculationUtils.calculateSubjectPositions(
               majorPlanWithIndividualSubjects,
               SubjectGroupingMode.FULL_GROUPING,
               ChartCalculationUtils.getSubjectConditionMap(majorPlanWithIndividualSubjects)
            )).toEqual(expected);
         });
      });
   });
});