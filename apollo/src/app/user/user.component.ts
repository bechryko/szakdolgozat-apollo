import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageSelectionComponent } from '@apollo/shared/languages';
import { ApolloUser } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { UserService } from '@apollo/shared/services';
import { Observable } from 'rxjs';
import { LoginComponent, RegisterComponent, UserSettingsComponent } from './components';
import { LoginData, RegisterData } from './models';

@Component({
   selector: 'apo-user',
   standalone: true,
   imports: [
      ApolloCommonModule,
      UserSettingsComponent,
      LoginComponent,
      RegisterComponent,
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
      this.loggedInUser$ = this.userService.user$.pipe(
         takeUntilDestroyed()
      );
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
