import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { deleteNullish } from '@apollo/shared/functions';
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
      MatSelectModule
   ],
   templateUrl: './user-settings.component.html',
   styleUrl: './user-settings.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent implements OnInit {
   @Input() public user!: ApolloUser;
   @Output() public readonly saveChanges = new EventEmitter<ApolloUser>();
   public userSettingsForm!: FormGroup;

   constructor(
      private readonly formBuilder: FormBuilder
   ) { }

   public ngOnInit(): void {
      this.userSettingsForm = AuthFormsUtils.buildUserSettingsForm(this.formBuilder, this.user);
   }

   public onSave(): void {
      const newUser: ApolloUser = {
         ...this.userSettingsForm.value,
         email: this.user.email,
         isAdmin: this.user.isAdmin
      };

      this.saveChanges.emit(deleteNullish(newUser));
   }
}
