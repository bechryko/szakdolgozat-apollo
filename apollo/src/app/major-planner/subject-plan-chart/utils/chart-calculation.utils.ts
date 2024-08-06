import { MajorPlan, SubjectGroupingMode } from "@apollo/major-planner/models";
import { cloneDeep } from "lodash";
import { ChartPositioningDescription, SubjectCondition, SubjectGroupingResult } from "../models";

export class ChartCalculationUtils {
   public static getSubjectConditionMap(majorPlan: MajorPlan): Record<string, SubjectCondition> {
      const subjectConditionMap: Record<string, SubjectCondition> = {};

      cloneDeep(majorPlan.semesters).reverse().forEach((semester) => {
         semester.subjects.forEach((subject) => {
            if(!subject.code) {
               return;
            }

            subject?.preconditions?.forEach((precondition) => {
               if (!subjectConditionMap[subject.code]) {
                  this.createEmptyCondition(subjectConditionMap, subject.code);
               }
               if (!subjectConditionMap[precondition]) {
                  this.createEmptyCondition(subjectConditionMap, precondition);
               }

               subjectConditionMap[precondition].next.push(subject.code);
               subjectConditionMap[subject.code].previous.push(precondition);
            });

            subject?.parallelConditions?.forEach((parallelCondition) => {
               if (!subjectConditionMap[subject.code]) {
                  this.createEmptyCondition(subjectConditionMap, subject.code);
               }
               if (!subjectConditionMap[parallelCondition]) {
                  this.createEmptyCondition(subjectConditionMap, parallelCondition);
               }

               subjectConditionMap[subject.code].parallel.push(parallelCondition);
               subjectConditionMap[parallelCondition].parallelBy.push(subject.code);
            });
         });
      });
      delete subjectConditionMap[String(undefined)];

      return subjectConditionMap;
   }

   public static calculateChartPositioning(majorPlan: MajorPlan, groupingMode: SubjectGroupingMode, subjectConditionMap: Record<string, SubjectCondition>): ChartPositioningDescription  {
      switch (groupingMode) {
         case SubjectGroupingMode.FLEXIBLE:
            return this.calculateChartPositioningFlexible(majorPlan, subjectConditionMap);
         case SubjectGroupingMode.STRICT_ORDER:
            return this.calculateChartPositioningStrictOrder(majorPlan);
         case SubjectGroupingMode.FULL_GROUPING:
            return this.calculateChartPositioningFullGrouping(majorPlan, subjectConditionMap);
      }
   }

   private static calculateChartPositioningFlexible(
      majorPlan: MajorPlan,
      subjectConditionMap: Record<string, SubjectCondition>
   ): ChartPositioningDescription {
      const result = this.calculateGroupedSubjectPositions(majorPlan, subjectConditionMap);
      const subjectPositions = result.groupedSubjectPositions;

      majorPlan.semesters.forEach(semester => {
         const occupiedPositions = semester.subjects.map(subject => subjectPositions[subject.code]).filter(position => position !== undefined);

         let currentPosition = 0;
         semester.subjects.forEach(subject => {
            if (subjectPositions[subject.code] === undefined) {
               while (occupiedPositions.includes(currentPosition)) {
                  currentPosition++;
               }

               subjectPositions[subject.code] = currentPosition;
               currentPosition++;
            }
         });
      });

      return { subjectPositions };
   }

   private static calculateChartPositioningStrictOrder(majorPlan: MajorPlan): ChartPositioningDescription {
      const subjectPositions: Record<string, number> = {};

      majorPlan.semesters.forEach(semester => {
         let lastPosition = 0;

         semester.subjects.forEach((subject) => {
            subjectPositions[subject.code] = lastPosition;
            lastPosition++;
         });
      });

      return { subjectPositions };
   }

   private static calculateChartPositioningFullGrouping(
      majorPlan: MajorPlan,
      subjectConditionMap: Record<string, SubjectCondition>
   ): ChartPositioningDescription {
      const result = this.calculateGroupedSubjectPositions(majorPlan, subjectConditionMap);
      const subjectPositions = result.groupedSubjectPositions;
      const semesterPositions = Array.from({ length: majorPlan.semesters.length }, () => result.firstAvailableYPosition);

      majorPlan.semesters.forEach((semester, semesterIndex) => {
         semester.subjects.forEach(subject => {
            if (subjectPositions[subject.code] === undefined) {
               subjectPositions[subject.code] = semesterPositions[semesterIndex];
               semesterPositions[semesterIndex]++;
            }
         });
      });

      return {
         subjectPositions,
         additionalHorizontalLines: result.subjectGroupBottomYPositions
      };
   }

   private static calculateGroupedSubjectPositions(
      majorPlan: MajorPlan,
      subjectConditionMap: Record<string, SubjectCondition>
   ): SubjectGroupingResult {
      const subjectPositions: Record<string, number> = {};
      const subjectGroups = this.groupSubjectsByConditions(majorPlan, subjectConditionMap);
      const semesterPositions = Array.from({ length: majorPlan.semesters.length }, () => 0);
      const subjectGroupBottomYPositions: number[] = [];

      subjectGroups.forEach(group => {
         let highestYPosition = 0;

         group.forEach(groupedSubjectCode => {
            for(let semesterIndex = 0; semesterIndex < majorPlan.semesters.length; semesterIndex++) {
               const subject = majorPlan.semesters[semesterIndex].subjects.find(subject => subject.code === groupedSubjectCode);

               if (subject) {
                  subjectPositions[subject.code] = semesterPositions[semesterIndex];
                  highestYPosition = Math.max(highestYPosition, semesterPositions[semesterIndex]);
                  semesterPositions[semesterIndex]++;
                  return;
               }
            }
         });

         const highestSemesterPosition = Math.max(...semesterPositions);
         semesterPositions.forEach((_, index) => {
            semesterPositions[index] = highestSemesterPosition;
         });

         subjectGroupBottomYPositions.push(highestYPosition);
      });

      return {
         groupedSubjectPositions: subjectPositions,
         firstAvailableYPosition: semesterPositions[0],
         subjectGroupBottomYPositions
      };
   }

   private static groupSubjectsByConditions(majorPlan: MajorPlan, subjectConditionMap: Record<string, SubjectCondition>): string[][] {
      const subjectGroups: string[][] = [];
      const visitedSubjects: Record<string, boolean> = {};

      majorPlan.semesters.forEach(semester => {
         semester.subjects.forEach(subject => {
            if (!subjectConditionMap[subject.code] || visitedSubjects[subject.code]) {
               return;
            }

            const group: string[] = [];
            this.visitSubjectConditionsRecursive(subject.code, subjectConditionMap, visitedSubjects, group);
            subjectGroups.push(group);
         });
      });

      return subjectGroups;
   }

   private static visitSubjectConditionsRecursive(
      subjectCode: string,
      subjectConditionMap: Record<string, SubjectCondition>,
      visitedSubjects: Record<string, boolean>,
      group: string[]
   ): void {
      if (visitedSubjects[subjectCode]) {
         return;
      }

      visitedSubjects[subjectCode] = true;
      group.push(subjectCode);

      subjectConditionMap[subjectCode].next.forEach((nextSubjectCode) => {
         this.visitSubjectConditionsRecursive(nextSubjectCode, subjectConditionMap, visitedSubjects, group);
      });

      subjectConditionMap[subjectCode].previous.forEach((previousSubjectCode) => {
         this.visitSubjectConditionsRecursive(previousSubjectCode, subjectConditionMap, visitedSubjects, group);
      });

      subjectConditionMap[subjectCode].parallel.forEach((parallelSubjectCode) => {
         this.visitSubjectConditionsRecursive(parallelSubjectCode, subjectConditionMap, visitedSubjects, group);
      });

      subjectConditionMap[subjectCode].parallelBy.forEach((parallelBySubjectCode) => {
         this.visitSubjectConditionsRecursive(parallelBySubjectCode, subjectConditionMap, visitedSubjects, group);
      });
   }

   private static createEmptyCondition(conditionMap: Record<string, SubjectCondition>, subjectCode: string): void {
      conditionMap[subjectCode] = {
         next: [],
         previous: [],
         parallel: [],
         parallelBy: []
      };
   }
}
