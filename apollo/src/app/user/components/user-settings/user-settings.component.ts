import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Signal, WritableSignal, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { deleteNullish } from '@apollo/shared/functions';
import { GeneralDialogService } from '@apollo/shared/general-dialog';
import { Language, LanguageSelectionComponent, MultiLanguagePipe } from '@apollo/shared/languages';
import { ApolloUser, University } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { UniversitiesService } from '@apollo/shared/services';
import { StudyFormGroup, UserSettingsForm } from '@apollo/user/models';
import { AuthFormsUtils } from '../../utils';
import { GetFacultiesForStudyPipe, GetMajorsForStudyPipe } from './pipes';

@Component({
   selector: 'apo-user-settings',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatExpansionModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      LanguageSelectionComponent,
      MultiLanguagePipe,
      GetFacultiesForStudyPipe,
      GetMajorsForStudyPipe
   ],
   templateUrl: './user-settings.component.html',
   styleUrl: './user-settings.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent implements OnInit {
   public readonly universities: Signal<University[]>;

   public readonly selectedStudyId: WritableSignal<string | undefined>;

   public readonly user = input.required<ApolloUser>();
   @Output() public readonly saveChanges = new EventEmitter<ApolloUser>();
   @Output() public readonly logout = new EventEmitter<void>();
   public userSettingsForm!: UserSettingsForm;
   public selectedLanguage?: Language;

   constructor(
      private readonly universitiesService: UniversitiesService,
      private readonly fb: NonNullableFormBuilder,
      private readonly dialogService: GeneralDialogService,
      private readonly cdr: ChangeDetectorRef
   ) {
      this.selectedStudyId = signal(undefined);

      this.universities = toSignal(this.universitiesService.universities$, { initialValue: [] });
   }

   public ngOnInit(): void {
      const user = this.user();
      this.userSettingsForm = AuthFormsUtils.buildUserSettingsForm(this.fb, user);
      this.selectedLanguage = user.selectedLanguage;
      this.selectedStudyId.set(user.settings.selectedStudyId);
   }

   public onSelectLanguage(language: Language): void {
      this.selectedLanguage = language;
   }

   public onSelectStudy(studyId: string): void {
      this.selectedStudyId.set(studyId);
   }

   public onUniversityChange(universityId: string | undefined, studyFormGroup: StudyFormGroup): void {
      const facultyControl = studyFormGroup.controls.faculty;

      facultyControl.setValue(undefined);
      if(universityId) {
         facultyControl.enable();
      } else {
         facultyControl.disable();
      }
   }

   public onFacultyChange(facultyId: number | undefined, studyFormGroup: StudyFormGroup): void {
      const majorControl = studyFormGroup.controls.major;

      majorControl.setValue(undefined);
      if(facultyId !== undefined) {
         majorControl.enable();
      } else {
         majorControl.disable();
      }
   }

   public addStudy(): void {
      this.dialogService.openConfirmationDialog({
         title: "PROFILE.SETTINGS.STUDY_SETTINGS.ADD_STUDY_CONFIRMATION_DIALOG.TITLE",
         description: "PROFILE.SETTINGS.STUDY_SETTINGS.ADD_STUDY_CONFIRMATION_DIALOG.DESCRIPTION",
         confirmationText: "PROFILE.SETTINGS.STUDY_SETTINGS.ADD_STUDY_CONFIRMATION_DIALOG.CONFIRMATION_TEXT"
      }).subscribe(result => {
         if(result) {
            this.userSettingsForm.controls.studies.push(AuthFormsUtils.buildStudyFormGroup(this.fb));
            this.cdr.markForCheck();
         }
      });
   }

   public onSave(): void {
      const user = this.user();
      const newUser: ApolloUser = {
         ...this.userSettingsForm.value as any,
         selectedLanguage: this.selectedLanguage,
         email: user.email,
         isAdmin: user.isAdmin,
         settings: {
            ...user.settings,
            selectedStudyId: this.selectedStudyId()
         }
      };

      if(!this.selectedLanguage) {
         delete newUser.selectedLanguage;
      }

      this.saveChanges.emit(deleteNullish(newUser));
   }

   public onLogout(): void {
      this.logout.emit();
   }
}
