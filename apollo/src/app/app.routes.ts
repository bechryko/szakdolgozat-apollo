import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AveragesComponent } from './averages/averages.component';
import { averagesFeature } from './averages/store';
import { MenuComponent } from './menu/menu.component';
import { MenuEffects, menuFeature } from './menu/store';
import { TimetableEffects, timetableFeature } from './timetable/store';
import { TimetableComponent } from './timetable/timetable.component';

export enum RouteUrls {
   MENU = 'menu',
   AVERAGES = 'averages',
   MAJOR_COMPLETION = 'major-completion',
   TIMETABLE = 'timetable'
}

export const routes: Routes = [
   {
      path: RouteUrls.MENU,
      component: MenuComponent,
      providers: [
         provideState(menuFeature),
         provideEffects(MenuEffects)
      ]
   },
   {
      path: RouteUrls.TIMETABLE,
      component: TimetableComponent,
      providers: [
         provideState(timetableFeature),
         provideEffects(TimetableEffects)
      ]
   },
   {
      path: RouteUrls.AVERAGES,
      component: AveragesComponent,
      providers: [
         provideState(averagesFeature)
      ]
   },
   {
      path: '**',
      redirectTo: RouteUrls.MENU
   }
];
