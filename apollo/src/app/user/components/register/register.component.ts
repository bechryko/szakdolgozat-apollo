import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { Observable, map, startWith } from 'rxjs';
import { RegisterData } from '../../models';
import { AuthFormsUtils } from '../../utils';

@Component({
   selector: 'apo-register',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      ReactiveFormsModule
   ],
   templateUrl: './register.component.html',
   styleUrl: '../../styles/auth-forms.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
   @Output() public readonly register: EventEmitter<RegisterData> = new EventEmitter();
   public readonly registerForm: FormGroup;
   public readonly isFormInvalid$: Observable<boolean>;

   constructor(
      private readonly fb: FormBuilder
   ) {
      this.registerForm = AuthFormsUtils.buildRegisterForm(this.fb);
      this.isFormInvalid$ = this.registerForm.statusChanges.pipe(
         map(status => status !== 'VALID'),
         startWith(this.registerForm.invalid)
      );
   }

   public onRegister(): void {
      const formValue = this.registerForm.value;
      delete formValue.confirmPassword;
      this.register.emit(formValue);
   }
}
