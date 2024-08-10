import { NonNullableFormBuilder, ValidatorFn, Validators } from "@angular/forms";
import { ApolloUser, ApolloUserStudy } from "@apollo/shared/models";
import { LoginForm, RegisterForm, StudyFormGroup, UserSettingsForm } from "../models";

export class AuthFormsUtils {
   public static buildLoginForm(fb: NonNullableFormBuilder): LoginForm {
      return fb.group({
         email: ['', [ Validators.required, Validators.email ]],
         password: ['', [ Validators.required, Validators.minLength(6) ]] // TODO: enhance validation
      });
   }

   public static buildRegisterForm(fb: NonNullableFormBuilder): RegisterForm {
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

   public static buildUserSettingsForm(fb: NonNullableFormBuilder, user: ApolloUser): UserSettingsForm {
      return fb.group({
         username: [user.username, [ Validators.required, Validators.minLength(3) ]],
         studies: fb.array(user.studies.map(study => this.buildStudyFormGroup(fb, study))),
      });
   }

   public static buildStudyFormGroup(fb: NonNullableFormBuilder, study?: ApolloUserStudy): StudyFormGroup {
      study ??= { studyId: String(Math.floor(Date.now() * Math.random())) };
      
      return fb.group({
         studyId: study.studyId!,
            university: study.university,
            faculty: study.faculty,
            major: study.major
      });
   }
}
