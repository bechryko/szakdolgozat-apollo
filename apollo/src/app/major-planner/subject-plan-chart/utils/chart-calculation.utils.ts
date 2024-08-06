import { MajorPlan, SubjectGroupingMode } from "@apollo/major-planner/models";
import { cloneDeep } from "lodash";
import { SubjectCondition } from "../models";

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

   public static calculateSubjectPositions(majorPlan: MajorPlan, groupingMode: SubjectGroupingMode, subjectConditionMap: Record<string, SubjectCondition>): Record<string, number> {
      switch (groupingMode) {
         case SubjectGroupingMode.FLEXIBLE:
            return this.calculateSubjectPositionsFlexible(majorPlan, subjectConditionMap);
         case SubjectGroupingMode.STRICT_ORDER:
            return this.calculateSubjectPositionsStrictOrder(majorPlan);
         case SubjectGroupingMode.FULL_GROUPING:
            return this.calculateSubjectPositionsFullGrouping(majorPlan, subjectConditionMap);
      }
   }

   private static calculateSubjectPositionsFlexible(majorPlan: MajorPlan, subjectConditionMap: Record<string, SubjectCondition>): Record<string, number> {
      const subjectPositions: Record<string, number> = {};
      this.fillGroupedSubjectPositions(subjectPositions, majorPlan, subjectConditionMap);

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

      return subjectPositions;
   }

   private static calculateSubjectPositionsStrictOrder(majorPlan: MajorPlan): Record<string, number> {
      const subjectPositions: Record<string, number> = {};

      majorPlan.semesters.forEach(semester => {
         let lastPosition = 0;

         semester.subjects.forEach((subject) => {
            subjectPositions[subject.code] = lastPosition;
            lastPosition++;
         });
      });

      return subjectPositions;
   }

   private static calculateSubjectPositionsFullGrouping(majorPlan: MajorPlan, subjectConditionMap: Record<string, SubjectCondition>): Record<string, number> {
      const subjectPositions: Record<string, number> = {};
      const semesterPositions = this.fillGroupedSubjectPositions(subjectPositions, majorPlan, subjectConditionMap);

      majorPlan.semesters.forEach((semester, semesterIndex) => {
         semester.subjects.forEach(subject => {
            if (subjectPositions[subject.code] === undefined) {
               subjectPositions[subject.code] = semesterPositions[semesterIndex];
               semesterPositions[semesterIndex]++;
            }
         });
      });

      return subjectPositions;
   }

   private static fillGroupedSubjectPositions(
      subjectPositions: Record<string, number>,
      majorPlan: MajorPlan,
      subjectConditionMap: Record<string, SubjectCondition>
   ): number[] {
      const subjectGroups = this.groupSubjectsByConditions(majorPlan, subjectConditionMap);
      const semesterPositions = Array.from({ length: majorPlan.semesters.length }, () => 0);

      subjectGroups.forEach(group => {
         group.forEach(groupedSubjectCode => {
            for(let semesterIndex = 0; semesterIndex < majorPlan.semesters.length; semesterIndex++) {
               const subject = majorPlan.semesters[semesterIndex].subjects.find(subject => subject.code === groupedSubjectCode);

               if (subject) {
                  subjectPositions[subject.code] = semesterPositions[semesterIndex];
                  semesterPositions[semesterIndex]++;
                  return;
               }
            };
         });

         const highestSemesterPosition = Math.max(...semesterPositions);
         semesterPositions.forEach((_, index) => {
            semesterPositions[index] = highestSemesterPosition;
         });
      });

      return semesterPositions;
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
