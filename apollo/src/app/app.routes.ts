import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminUniversityComponent, universityResolver } from './admin-page/admin-university';
import { AveragesComponent } from './averages/averages.component';
import { averagesFeature } from './averages/store';
import { MenuComponent } from './menu/menu.component';
import { MenuEffects, menuFeature } from './menu/store';
import { TimetableEffects, timetableFeature } from './timetable/store';
import { TimetableComponent } from './timetable/timetable.component';
import { UserComponent } from './user/user.component';

export enum RouteUrls {
   MENU = 'menu',
   AVERAGES = 'averages',
   MAJOR_COMPLETION = 'major-completion',
   TIMETABLE = 'timetable',
   USER = 'profile',
   ADMINISTRATION = 'administration',
   ADMIN_UNIVERSITY = 'administration/university'
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
      path: RouteUrls.ADMINISTRATION,
      component: AdminPageComponent
   },
   {
      path: RouteUrls.ADMIN_UNIVERSITY,
      component: AdminUniversityComponent,
      resolve: {
         university: universityResolver
      }
   },
   {
      path: RouteUrls.USER,
      component: UserComponent
   },
   {
      path: '**',
      redirectTo: RouteUrls.MENU
   }
];
