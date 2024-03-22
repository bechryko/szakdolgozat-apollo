import { FormBuilder, ValidatorFn, Validators } from "@angular/forms";
import { ApolloUser } from "@apollo/shared/models";

export class AuthFormsUtils {
   public static buildLoginForm(fb: FormBuilder) {
      return fb.group({
         email: ['', [ Validators.required, Validators.email ]],
         password: ['', [ Validators.required, Validators.minLength(6) ]] // TODO: enhance validation
      });
   }

   public static buildRegisterForm(fb: FormBuilder) {
      return fb.group({
         email: ['', [ Validators.required, Validators.email ]],
         username: '',
         password: ['', [ Validators.required, Validators.minLength(6) ]], // TODO: enhance validation
         confirmPassword: ''
      }, { validators: this.getPasswordMatchValidator() });
   }

   private static getPasswordMatchValidator(): ValidatorFn {
      return (control) => {
         const password = control.get('password');
         const confirmPassword = control.get('confirmPassword');

         return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
      };
   }

   public static buildUserSettingsForm(fb: FormBuilder, user: ApolloUser) {
      return fb.group({
         username: [user.username, [ Validators.required, Validators.minLength(3) ]],
         university: user.university,
         faculty: user.faculty,
         major: user.major,
         studyMode: user.studyMode,
         curriculumYear: user.curriculumYear
      });
   }
}
