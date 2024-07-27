import { MajorPlan } from "@apollo/major-planner/models";
import { cloneDeep } from "lodash";
import { SubjectCondition } from "../models";

export class ChartCalculationUtils {
   public static getSubjectConditionMap(majorPlan: MajorPlan): Record<string, SubjectCondition> {
      const subjectConditionMap: Record<string, SubjectCondition> = {};

      cloneDeep(majorPlan.semesters).reverse().forEach((semester) => {
         semester.subjects.forEach((subject) => {
            if (!subjectConditionMap[subject.code]) {
               this.createEmptyCondition(subjectConditionMap, subject.code);
            }

            subject?.preconditions?.forEach((precondition) => {
               if (!subjectConditionMap[precondition]) {
                  this.createEmptyCondition(subjectConditionMap, precondition);
               }

               subjectConditionMap[precondition].next.push(subject.code);
            });

            subject?.parallelConditions?.forEach((parallelCondition) => {
               if (!subjectConditionMap[parallelCondition]) {
                  this.createEmptyCondition(subjectConditionMap, parallelCondition);
               }

               subjectConditionMap[subject.code].parallel.push(parallelCondition);
            });
         });
      });
      delete subjectConditionMap[String(undefined)];

      return subjectConditionMap;
   }

   private static createEmptyCondition(conditionMap: Record<string, SubjectCondition>, subjectCode: string): void {
      conditionMap[subjectCode] = {
         next: [],
         parallel: []
      };
   }
}
