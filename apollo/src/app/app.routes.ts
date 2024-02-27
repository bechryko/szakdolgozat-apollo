import { Routes } from '@angular/router';

export enum RouteUrls {
   AVERAGES = 'averages',
   MAJOR_COMPLETION = 'major-completion',
   TIMETABLE = 'timetable'
}

export const routes: Routes = [
   {
      path: '',
      redirectTo: RouteUrls.AVERAGES,
      pathMatch: 'full'
   },
   {
      path: '**',
      redirectTo: ''
   }
];
