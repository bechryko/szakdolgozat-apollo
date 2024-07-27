import { MajorPlanSemester } from "./major-plan-semester";

export interface MajorPlan {
   id: string;
   name: string;
   semesters: MajorPlanSemester[];
}
