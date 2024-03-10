import { Routes } from '@angular/router';
import { MenuComponent } from '@apollo-menu/menu.component';
import { MenuEffects, menuFeature } from '@apollo-menu/store';
import { TimetableEffects, timetableFeature } from '@apollo-timetable/store';
import { TimetableComponent } from '@apollo-timetable/timetable.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

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
      path: '**',
      redirectTo: RouteUrls.MENU
   }
];
