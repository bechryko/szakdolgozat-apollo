import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'apo-timetable',
  standalone: true,
  imports: [],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableComponent {

}
