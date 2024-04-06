import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdminMajorComponent } from './admin-page/admin-major';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminUniversityComponent } from './admin-page/admin-university';
import { majorRouteParam, universityRouteParam } from './admin-page/constants';
import { majorResolver, universityResolver } from './admin-page/resolvers';
import { AveragesComponent } from './averages/averages.component';
import { userMajorResolver } from './averages/resolvers';
import { averagesFeature } from './averages/store';
import { MenuComponent } from './menu/menu.component';
import { MenuEffects, menuFeature } from './menu/store';
import { parameterizedRoute } from './shared/functions';
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
   ADMIN_UNIVERSITY = 'administration/university',
   ADMIN_MAJOR = 'administration/major',
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
      ],
      resolve: {
         userMajor: userMajorResolver
      }
   },
   {
      path: RouteUrls.ADMINISTRATION,
      component: AdminPageComponent
   },
   {
      path: parameterizedRoute(RouteUrls.ADMIN_UNIVERSITY, universityRouteParam),
      component: AdminUniversityComponent,
      resolve: {
         university: universityResolver
      }
   },
   {
      path: parameterizedRoute(RouteUrls.ADMIN_MAJOR, universityRouteParam, majorRouteParam),
      component: AdminMajorComponent,
      resolve: {
         university: universityResolver,
         major: majorResolver
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
