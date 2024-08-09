import { FormArray, FormControl, FormGroup } from "@angular/forms";

export type LoginForm = FormGroup<{
   email: FormControl<string>;
   password: FormControl<string>;
}>;

export type RegisterForm = FormGroup<{
   email: FormControl<string>;
   username: FormControl<string>;
   password: FormControl<string>;
   confirmPassword: FormControl<string>;
}>;

export type UserSettingsForm = FormGroup<{
   username: FormControl<string>;
   studies: FormArray<StudyFormGroup>
}>;

export type StudyFormGroup = FormGroup<{
   studyId: FormControl<string>;
   university: FormControl<string | undefined>;
   faculty: FormControl<number | undefined>;
   major: FormControl<string | undefined>;
}>;
