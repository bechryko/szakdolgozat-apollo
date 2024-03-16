import { Grade } from "./grade";

export interface AlternativeGrade extends Grade {
   disabled?: boolean;
   bonus?: boolean;
}
