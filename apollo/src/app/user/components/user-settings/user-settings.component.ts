import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { deleteNullish } from '@apollo/shared/functions';
import { LanguageSelectionComponent } from '@apollo/shared/languages';
import { ApolloUser } from '@apollo/shared/models';
import { TranslocoPipe } from '@ngneat/transloco';
import { AuthFormsUtils } from '../../utils';

@Component({
   selector: 'apo-user-settings',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatExpansionModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatSelectModule,
      LanguageSelectionComponent
   ],
   templateUrl: './user-settings.component.html',
   styleUrl: './user-settings.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent implements OnInit {
   @Input() public user!: ApolloUser;
   @Output() public readonly saveChanges = new EventEmitter<ApolloUser>();
   public userSettingsForm!: FormGroup;
   public selectedLanguage?: string;

   constructor(
      private readonly formBuilder: FormBuilder
   ) { }

   public ngOnInit(): void {
      this.userSettingsForm = AuthFormsUtils.buildUserSettingsForm(this.formBuilder, this.user);
      this.selectedLanguage = this.user.selectedLanguage;
   }

   public onSelectLanguage(language: string): void {
      this.selectedLanguage = language;
   }

   public onSave(): void {
      const newUser: ApolloUser = {
         ...this.userSettingsForm.value,
         selectedLanguage: this.selectedLanguage,
         email: this.user.email,
         isAdmin: this.user.isAdmin
      };

      if(!this.selectedLanguage) {
         delete newUser.selectedLanguage;
      }

      this.saveChanges.emit(deleteNullish(newUser));
   }
}
