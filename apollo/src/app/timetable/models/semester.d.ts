import { Activity } from "./activity";
import { ActivityCategory } from "./activity-category";

export interface Semester {
   id: string;
   name: string;
   owner: string;
   activities: Activity[];
   categories: ActivityCategory[];
}
