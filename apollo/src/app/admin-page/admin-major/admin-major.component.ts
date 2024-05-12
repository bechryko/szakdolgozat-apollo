import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { FileUploadComponent, FileUploadDataConfirmationDialogComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University, UniversityMajor, UniversityMajorSubjectGroup, UniversityMajorSubjectGroupSubject, UniversityScholarshipYear, UniversitySpecialization, UniversitySpecializationSubjectGroup, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { CurrencyPipe, GetSubjectsPipe } from '@apollo/shared/pipes';
import { UniversitiesService } from '@apollo/shared/services';
import { TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { filter, map, take } from 'rxjs';
import { CreditSumPipe } from '../pipes';
import { UniversityScholarshipData } from './../../shared/models/university-scholarship-year.d';
import { MajorUploadConfirmationDialogComponent } from './major-upload-confirmation-dialog';

@Component({
   selector: 'apo-admin-major',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatFormFieldModule,
      MatInputModule,
      MatTabsModule,
      MatExpansionModule,
      GetSubjectsPipe,
      FileUploadComponent,
      FormsModule,
      CreditSumPipe,
      MatDividerModule,
      MultiLanguagePipe,
      CurrencyPipe,
      MatSelectModule
   ],
   templateUrl: './admin-major.component.html',
   styleUrl: './admin-major.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMajorComponent {
   public readonly university: Signal<University | undefined>;
   public readonly universitySubjects: WritableSignal<UniversitySubject[] | undefined>;

   public readonly major: WritableSignal<UniversityMajor | undefined>;
   public readonly selectedUniversityMajorSubjectGroup: WritableSignal<UniversityMajorSubjectGroup | undefined>;
   public readonly selectedUniversityMajorSubject: WritableSignal<UniversityMajorSubjectGroupSubject | undefined>;
   public readonly selectedSpecialization: WritableSignal<UniversitySpecialization | undefined>;
   public readonly selectedSpecializationSubjectGroup: WritableSignal<UniversitySpecializationSubjectGroup | undefined>;
   public readonly selectedSpecializationSubjectSubGroup: WritableSignal<UniversityMajorSubjectGroup | undefined>;
   public readonly selectedScholarshipYear: WritableSignal<UniversityScholarshipYear | undefined>;

   public readonly selectedSubject: WritableSignal<UniversitySubject | undefined>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly universitiesService: UniversitiesService,
      private readonly location: Location,
      private readonly dialog: MatDialog,
      private readonly transloco: TranslocoService
   ) {
      this.universitySubjects = signal(undefined);

      this.major = signal(undefined);
      this.selectedUniversityMajorSubjectGroup = signal(undefined);
      this.selectedUniversityMajorSubject = signal(undefined);
      this.selectedSpecialization = signal(undefined);
      this.selectedSpecializationSubjectGroup = signal(undefined);
      this.selectedSpecializationSubjectSubGroup = signal(undefined);
      this.selectedScholarshipYear = signal(undefined);

      this.selectedSubject = signal(undefined);

      this.university = toSignal(this.activatedRoute.data.pipe(
         take(1),
         map(({ university, major }) => {
            if (university) {
               this.universitiesService.getSubjectsForUniversity(university.id).pipe(
                  take(1)
               ).subscribe(subjects => {
                  this.universitySubjects.set(cloneDeep(subjects));
               });
            }

            if (major) {
               const majorFromBackend: UniversityMajor = cloneDeep(major);
               majorFromBackend.scholarships ??= [];
               majorFromBackend.specializations ??= [];
               this.major.set(majorFromBackend);
            }

            return university;
         }),
         filter(Boolean)
      ));
   }

   public back(): void {
      this.location.back();
   }

   public saveMajor(): void {
      this.universitiesService.saveSingleUniversityMajor(cloneDeep(this.major()!));
   }

   public selectSubject(subjectCode?: string, group?: UniversityMajorSubjectGroup): void {
      const subject = group?.subjects.find(s => s.code === subjectCode);
      const cancelSelection = !subject || this.selectedUniversityMajorSubject() === subject;
      this.selectedUniversityMajorSubject.set(cancelSelection ? undefined : subject);
      this.selectedUniversityMajorSubjectGroup.set(cancelSelection ? undefined : group);
   }

   public deleteGroupSubject(subject: UniversityMajorSubjectGroupSubject, group: UniversityMajorSubjectGroup): void {
      this.selectSubject();

      const major = this.major()!;
      const newGroup = {
         ...group,
         subjects: group.subjects.filter(s => s !== subject)
      };
      const newSubjectGroups = cloneDeep(major.subjectGroups);
      const groupIndex = major.subjectGroups.indexOf(group);
      if(newGroup.subjects.length === 0) {
         newSubjectGroups.splice(groupIndex, 1);
      } else {
         newSubjectGroups.splice(groupIndex, 1, newGroup);
      }
      this.major.set({
         ...major,
         subjectGroups: newSubjectGroups
      });
   }

   public selectSpecialization(specialization: UniversitySpecialization): void {
      this.selectedSpecializationSubjectSubGroup.set(undefined);
      this.selectedSpecialization.set(specialization === this.selectedSpecialization() ? undefined : specialization);
   }

   public selectSpecializationSubjectSubGroup(subGroup: UniversityMajorSubjectGroup, group: UniversitySpecializationSubjectGroup): void {
      const cancelSelection = subGroup === this.selectedSpecializationSubjectSubGroup();
      this.selectedSpecializationSubjectSubGroup.set(cancelSelection ? undefined : subGroup);
      this.selectedSpecializationSubjectGroup.set(cancelSelection ? undefined : group);
   }

   public deleteSubjectFromSpecialization(subjectCode: string, group: UniversityMajorSubjectGroup): void {
      group.subjects = group.subjects.filter(s => s.code !== subjectCode);
   }

   public addSubjectToGroup(group: UniversityMajorSubjectGroup): void {
      group.subjects = [ ...group.subjects, this.selectedSubject()! ];
      this.selectedSubject.set(undefined);
   }

   public addScholarshipYear(): void {
      const major = this.major()!;
      const newScholarshipYear: UniversityScholarshipYear = {
         name: this.transloco.translate('ADMINISTRATION.MAJOR_DETAILS.NEW_SCHOLARSHIP_YEAR'),
         firstSemester: [],
         secondSemester: []
      };
      this.major.set({
         ...major,
         scholarships: [
            ...cloneDeep(major.scholarships!),
            newScholarshipYear
         ]
      });
      this.selectedScholarshipYear.set(newScholarshipYear);
   }

   public selectScholarshipYear(year: UniversityScholarshipYear): void {
      this.selectedScholarshipYear.set(year === this.selectedScholarshipYear() ? undefined : year);
   }

   public deleteScholarshipYear(year: UniversityScholarshipYear): void {
      this.selectedScholarshipYear.set(undefined);
      this.major.set({
         ...this.major()!,
         scholarships: this.major()!.scholarships!.filter(y => y !== year)
      });
   }

   public onMajorDataUpload(data: string): void {
      const newSubjects = NeptunExportParserUtils.parseUniversitySubjects(data, this.universitySubjects());
      if (newSubjects.length === 0) {
         this.onMajorSubjectGroupsUpload(data);
         return;
      }

      this.dialog.open(FileUploadDataConfirmationDialogComponent, {
         data: {
            data: newSubjects
         }
      }).afterClosed().subscribe((confirmed: boolean) => {
         if (confirmed) {
            this.onSubjectsUpload(newSubjects, () => {
               this.onMajorSubjectGroupsUpload(data);
            });
         }
      });
   }

   public onSubjectsUpload(data: RawUniversitySubject[], postCallback?: () => void): void { // TODO: forced upload dialog (file upload component input field)
      this.dialog.open(GeneralInputDialogComponent, {
         data: {
            title: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.TITLE",
            description: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.DESCRIPTION",
            inputType: 'text',
            inputLabel: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.LANGUAGE_LABEL"
         }
      }).afterClosed().subscribe(language => {
         if (!language) {
            return;
         }

         const previousSubjectsNumber = this.universitySubjects()!.length;
         this.universitySubjects.set([
            ...cloneDeep(this.universitySubjects()!),
            ...data.map((rawSubject, idx) => ({
               id: `${this.university()!.id}-${previousSubjectsNumber + idx}`,
               universityId: this.university()!.id,
               ...rawSubject,
               language
            }))
         ]);

         if (postCallback) {
            postCallback();
         }
      });
   }

   private onMajorSubjectGroupsUpload(data: string): void {
      const subjectGroups = NeptunExportParserUtils.parseUniversityMajor(data);
      this.dialog.open(MajorUploadConfirmationDialogComponent, {
         data: {
            majorGroups: subjectGroups,
            subjects: this.universitySubjects()!
         }
      }).afterClosed().subscribe((confirmed: boolean) => {
         if (!confirmed) {
            return;
         }

         this.major.set({
            ...this.major()!,
            subjectGroups
         });
         this.selectSubject();
      });
   }

   public onSpecializationsUpload(data: UniversitySpecialization[]): void {
      data.forEach(specialization => {
         const major = this.major()!;
         const existingSpecialization = major.specializations!.find(s => s.name === specialization.name);
         if (existingSpecialization) {
            major.specializations!.splice(major.specializations!.indexOf(existingSpecialization), 1, specialization);
         } else {
            this.major.set({
               ...major,
               specializations: [
                  ...major.specializations!,
                  specialization
               ]
            });
         }
      });
   }

   public onScholarshipUpload(data: UniversityScholarshipData[], array: UniversityScholarshipData[]): void {
      array.splice(0, array.length, ...data);
   }

   public getMajorParserFn() {
      return (exported: string) => exported;
   }

   public getSpecializationsParserFn() {
      return (exported: string) => NeptunExportParserUtils.parseSpecializationsData(exported, this.universitySubjects()!);
   }

   public getScholarshipParserFn() {
      return (exported: string) => NeptunExportParserUtils.parseScholarshipData(exported);
   }
}
