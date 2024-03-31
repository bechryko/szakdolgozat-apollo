import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { FileUploadComponent, FileUploadDataConfirmationDialogComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University, UniversityMajor, UniversityMajorSubjectGroup, UniversityMajorSubjectGroupSubject, UniversityScholarshipYear, UniversitySubject } from '@apollo/shared/models';
import { CurrencyPipe } from '@apollo/shared/pipes';
import { UniversitiesService } from '@apollo/shared/services';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { NgLetModule } from 'ng-let';
import { filter, map } from 'rxjs';
import { CreditSumPipe, GetSubjectsPipe } from '../pipes';
import { UniversityScholarshipData } from './../../shared/models/university-scholarship-year.d';
import { MajorUploadConfirmationDialogComponent } from './major-upload-confirmation-dialog';

@Component({
   selector: 'apo-admin-major',
   standalone: true,
   imports: [
      TranslocoPipe,
      CommonModule,
      NgLetModule,
      MatButtonModule,
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
      CurrencyPipe
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
   public readonly selectedScholarshipYear: WritableSignal<UniversityScholarshipYear | undefined>;

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
      this.selectedScholarshipYear = signal(undefined);

      this.university = toSignal(this.activatedRoute.data.pipe(
         map(({ university, major }) => {
            if (university) {
               this.universitiesService.getSubjectsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(subjects => {
                  this.universitySubjects.set(cloneDeep(subjects));
               });
            }

            if (major) {
               const majorFromBackend: UniversityMajor = cloneDeep(major);
               majorFromBackend.scholarships ??= [];
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
      this.universitiesService.saveSingleUniversityMajor(this.major()!);
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

   public onScholarshipUpload(data: UniversityScholarshipData[], array: UniversityScholarshipData[]): void {
      array.splice(0, array.length, ...data);
   }

   public getMajorParserFn() {
      return (exported: string) => exported;
   }

   public getScholarshipParserFn() {
      return (exported: string) => NeptunExportParserUtils.parseScholarshipData(exported);
   }
}
