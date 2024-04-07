import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { Observable, map, startWith } from 'rxjs';
import { LoginData } from '../../models';
import { AuthFormsUtils } from '../../utils';

@Component({
   selector: 'apo-login',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      ReactiveFormsModule
   ],
   templateUrl: './login.component.html',
   styleUrl: '../../styles/auth-forms.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
   @Output() public readonly login: EventEmitter<LoginData> = new EventEmitter();
   public readonly loginForm: FormGroup;
   public readonly isFormInvalid$: Observable<boolean>;

   constructor(
      private readonly fb: FormBuilder
   ) {
      this.loginForm = AuthFormsUtils.buildLoginForm(this.fb);
      this.isFormInvalid$ = this.loginForm.statusChanges.pipe(
         map(status => status !== 'VALID'),
         startWith(this.loginForm.invalid)
      );
   }

   public onLogin(): void {
      const formValue = this.loginForm.value as LoginData;
      this.login.emit(formValue);
   }
}
