import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { deleteNullish } from '@apollo/shared/functions';
import { LanguageSelectionComponent, MultiLanguagePipe } from '@apollo/shared/languages';
import { ApolloUser, University, UniversityMajor } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { UniversitiesService } from '@apollo/shared/services';
import { startWith, take } from 'rxjs';
import { AuthFormsUtils } from '../../utils';

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
      MultiLanguagePipe
   ],
   templateUrl: './user-settings.component.html',
   styleUrl: './user-settings.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent implements OnInit {
   public readonly universities: Signal<University[]>;

   public readonly selectedUniversityId: WritableSignal<string | undefined>;
   public readonly selectedUniversity: Signal<University | undefined>;
   public readonly selectedFaculty: WritableSignal<number | undefined>;

   public readonly majors: WritableSignal<UniversityMajor[]>;

   @Input() public user!: ApolloUser;
   @Output() public readonly saveChanges = new EventEmitter<ApolloUser>();
   @Output() public readonly logout = new EventEmitter<void>();
   public userSettingsForm!: FormGroup;
   public selectedLanguage?: string;

   constructor(
      private readonly universitiesService: UniversitiesService,
      private readonly formBuilder: FormBuilder
   ) {
      this.selectedUniversityId = signal('');
      this.selectedUniversity = computed(() => {
         return this.universities().find((university) => university.id === this.selectedUniversityId());
      });
      this.selectedFaculty = signal(undefined);

      this.majors = signal([]);

      this.universities = toSignal(this.universitiesService.universities$.pipe(
         startWith([]),
         takeUntilDestroyed()
      )) as Signal<University[]>;

      effect(() => {
         if(!this.selectedUniversityId()) {
            this.selectedFaculty.set(undefined);
         }
      }, { allowSignalWrites: true });

      effect(() => {
         const control = this.userSettingsForm.get('faculty');
         if(this.selectedUniversityId()) {
            control?.enable();
         } else {
            control?.disable();
         }
      });

      effect(() => {
         if(this.selectedFaculty() === undefined) {
            this.majors.set([]);
         } else if(this.selectedUniversityId()) {
            this.universitiesService.getMajorsForUniversity(this.selectedUniversityId()!).pipe(
               take(1)
            ).subscribe(majors => {
               this.majors.set(majors.filter(major => major.facultyId === this.selectedFaculty()));
            });
         }
      }, { allowSignalWrites: true });

      effect(() => {
         const control = this.userSettingsForm.get('major');
         if(this.selectedFaculty() !== undefined) {
            control?.enable();
         } else {
            control?.disable();
         }
      });
   }

   public ngOnInit(): void {
      this.userSettingsForm = AuthFormsUtils.buildUserSettingsForm(this.formBuilder, this.user);
      this.selectedLanguage = this.user.selectedLanguage;
      this.selectedUniversityId.set(this.user.university);
      this.selectedFaculty.set(this.user.faculty);
   }

   public onSelectLanguage(language: string): void {
      this.selectedLanguage = language;
   }

   public onSelectUniversity(universityId: string): void {
      this.selectedUniversityId.set(universityId);
   }

   public onSelectFaculty(facultyId: number | undefined): void {
      this.selectedFaculty.set(facultyId);
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

   public onLogout(): void {
      this.logout.emit();
   }
}
