import { ActivityLocationInterval } from "./activity-location-interval";
import { ActivityTime } from "./activity-time";

export interface Activity {
   name: string;
   courseCode?: string;
   location?: string;
   people?: string;
   time: ActivityTime;
   categoryName?: string;
   locationInterval?: ActivityLocationInterval;
}
