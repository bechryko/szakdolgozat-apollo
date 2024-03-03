import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LOCATION_ICON, NAME_ICON, PEOPLE_ICON } from '@apollo-shared/constants';
import { Activity } from '@apollo-timetable/models';

@Component({
   selector: 'apo-activity',
   standalone: true,
   imports: [],
   templateUrl: './activity.component.html',
   styleUrl: './activity.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityComponent {
   public readonly icons = {
      name: NAME_ICON,
      location: LOCATION_ICON,
      people: PEOPLE_ICON
   } as const;

   @Input() public activityData!: Activity;
}
