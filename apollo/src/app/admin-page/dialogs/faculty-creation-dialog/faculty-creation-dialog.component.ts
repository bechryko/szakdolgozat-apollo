import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LanguageLabelKeyPipe, MultiLanguage, MultiLanguagePipe, languages } from '@apollo/shared/languages';
import { SnackBarService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
   selector: 'apo-faculty-creation-dialog',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      LanguageLabelKeyPipe,
      MultiLanguagePipe
   ],
   templateUrl: './faculty-creation-dialog.component.html',
   styleUrl: './faculty-creation-dialog.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacultyCreationDialogComponent {
   public readonly availableLanguages = languages;
   public readonly form: FormGroup;
   private errorsSet = false;

   constructor(
      private readonly dialogRef: MatDialogRef<FacultyCreationDialogComponent, MultiLanguage<string>>,
      private readonly fb: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public readonly universityName: MultiLanguage<string>,
      private readonly snackbar: SnackBarService
   ) {
      this.form = this.buildFacultyForm();
   }

   public save(): void {
      if(this.form.valid) {
         this.dialogRef.close(this.form.value);
      } else {
         this.snackbar.open("ADMINISTRATION.UNIVERSITY.FACULTY_ADD_DIALOG.FORM_ERROR_SNACKBAR_MESSAGE");
         Object.values(this.form.controls).forEach(control => {
            if(!control.value) {
               control.setErrors({ required: true });
            }
         });
         this.errorsSet = true;
      }
   }

   public clearErrors(): void {
      if(!this.errorsSet) {
         return;
      }

      Object.values(this.form.controls).forEach(control => {
         control.setErrors(null);
      });
   }

   private buildFacultyForm() {
      return this.fb.group(this.availableLanguages.reduce((acc, lang) => ({
         ...acc,
         [lang]: ''
      }), {}), { validators: this.getFormValidator() });
   }

   private getFormValidator(): ValidatorFn {
      return (control) => {
         const hasValue = Object.values(control.value).some(Boolean);
         return hasValue ? null : { required: true };
      };
   }
}
