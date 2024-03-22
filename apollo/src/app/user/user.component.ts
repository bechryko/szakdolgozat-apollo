import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ApolloUser } from '@apollo/shared/models';
import { UserService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { Observable } from 'rxjs';
import { LanguageSelectionComponent, LoginComponent, RegisterComponent, UserSettingsComponent } from './components';
import { LoginData, RegisterData } from './models';

@Component({
   selector: 'apo-user',
   standalone: true,
   imports: [
      TranslocoPipe,
      NgLetModule,
      AsyncPipe,
      UserSettingsComponent,
      LoginComponent,
      RegisterComponent,
      MatButtonModule,
      LanguageSelectionComponent
   ],
   templateUrl: './user.component.html',
   styleUrl: './user.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent {
   public readonly loggedInUser$: Observable<ApolloUser | null>;

   constructor(
      private readonly userService: UserService
   ) {
      this.loggedInUser$ = this.userService.user$;
   }

   public onSaveUserSettings(user: ApolloUser): void {
      this.userService.updateUser(user);
   }

   public onLogin(loginData: LoginData): void {
      this.userService.login(loginData);
   }

   public onRegister(registerData: RegisterData): void {
      this.userService.register(registerData);
   }

   public onLogout(): void {
      this.userService.logout();
   }
}
