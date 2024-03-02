import { ActivityCategory } from "./activity-category";
import { ActivityTime } from "./activity-time";

export interface Activity {
   name: string;
   courseCode?: string;
   location?: string;
   people?: string;
   time: ActivityTime;
   category?: ActivityCategory; 
}
