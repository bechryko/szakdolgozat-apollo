import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdminMajorComponent } from './admin-page/admin-major';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminUniversityComponent } from './admin-page/admin-university';
import { majorRouteParam, universityRouteParam } from './admin-page/constants';
import { majorResolver, universityResolver } from './admin-page/resolvers';
import { AveragesComponent } from './averages/averages.component';
import { averagesFeature } from './averages/store';
import { MajorCompletionComponent } from './major-completion/major-completion.component';
import { MajorPlannerComponent } from './major-planner/major-planner.component';
import { MenuComponent } from './menu/menu.component';
import { MenuEffects, menuFeature } from './menu/store';
import { NoAccessComponent } from './shared/components';
import { parameterizedRoute } from './shared/functions';
import { adminGuard, loginGuard } from './shared/guards';
import { universitySubjectsResolver, userMajorResolver } from './shared/resolvers';
import { TimetableEffects, timetableFeature } from './timetable/store';
import { TimetableComponent } from './timetable/timetable.component';
import { UserComponent } from './user/user.component';

export enum RouteUrls {
   MENU = 'menu',
   AVERAGES = 'averages',
   MAJOR_COMPLETION = 'major-completion',
   TIMETABLE = 'timetable',
   MAJOR_PLANNER = 'major-planner',
   USER = 'profile',
   ADMINISTRATION = 'administration',
   ADMIN_UNIVERSITY = 'administration/university',
   ADMIN_MAJOR = 'administration/major',
   NO_ACCESS = 'not-found'
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
      component: AdminPageComponent,
      canActivate: [ adminGuard ]
   },
   {
      path: parameterizedRoute(RouteUrls.ADMIN_UNIVERSITY, universityRouteParam),
      component: AdminUniversityComponent,
      resolve: {
         university: universityResolver
      },
      canActivate: [ adminGuard ]
   },
   {
      path: parameterizedRoute(RouteUrls.ADMIN_MAJOR, universityRouteParam, majorRouteParam),
      component: AdminMajorComponent,
      resolve: {
         university: universityResolver,
         major: majorResolver
      },
      canActivate: [ adminGuard ]
   },
   {
      path: RouteUrls.MAJOR_COMPLETION,
      component: MajorCompletionComponent,
      resolve: {
         userMajor: userMajorResolver,
         universitySubjects: universitySubjectsResolver
      },
      canActivate: [ loginGuard ]
   },
   {
      path: RouteUrls.MAJOR_PLANNER,
      component: MajorPlannerComponent
   },
   {
      path: RouteUrls.USER,
      component: UserComponent
   },
   {
      path: parameterizedRoute(RouteUrls.NO_ACCESS, "reason"),
      component: NoAccessComponent
   },
   {
      path: '**',
      redirectTo: RouteUrls.MENU
   }
];
