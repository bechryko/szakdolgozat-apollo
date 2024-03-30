import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { bypassFirebaseFreePlan } from '@apollo/shared/constants';
import { FileUploadComponent, FileUploadDataConfirmationDialogComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University, UniversityMajor, UniversityMajorSubjectGroup, UniversityMajorSubjectGroupSubject, UniversitySubject } from '@apollo/shared/models';
import { RouterService, UniversitiesService } from '@apollo/shared/services';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { NgLetModule } from 'ng-let';
import { map, tap } from 'rxjs';
import { MajorUploadConfirmationDialogComponent } from './major-upload-confirmation-dialog';
import { CreditSumPipe, GetSubjectsPipe } from './pipes';

@Component({
   selector: 'apo-admin-university',
   standalone: true,
   imports: [
      TranslocoPipe,
      CommonModule,
      NgLetModule,
      MultiLanguagePipe,
      MatButtonModule,
      MatTabsModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      FileUploadComponent,
      MatExpansionModule,
      GetSubjectsPipe,
      MatSelectModule,
      MatDividerModule,
      CreditSumPipe
   ],
   templateUrl: './admin-university.component.html',
   styleUrl: './admin-university.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUniversityComponent {
   public readonly university: Signal<University | undefined>;

   public readonly universitySubjects: WritableSignal<UniversitySubject[] | undefined>;
   public readonly selectedUniversitySubject: WritableSignal<UniversitySubject | undefined>;

   public readonly universityMajors: WritableSignal<UniversityMajor[] | undefined>;
   public readonly selectedUniversityMajor: WritableSignal<UniversityMajor | undefined>;
   public readonly selectedUniversityMajorSubjectGroup: WritableSignal<UniversityMajorSubjectGroup | undefined>;
   public readonly selectedUniversityMajorSubject: WritableSignal<UniversityMajorSubjectGroupSubject | undefined>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly routerService: RouterService,
      private readonly universitiesService: UniversitiesService,
      private readonly dialog: MatDialog,
      private readonly transloco: TranslocoService
   ) {
      this.universitySubjects = signal(undefined);
      this.selectedUniversitySubject = signal(undefined);

      this.universityMajors = signal(undefined);
      this.selectedUniversityMajor = signal(undefined);
      this.selectedUniversityMajorSubjectGroup = signal(undefined);
      this.selectedUniversityMajorSubject = signal(undefined);

      this.university = toSignal(this.activatedRoute.data.pipe(
         map(({ university }) => university),
         tap(university => {
            if (university) {
               this.universitiesService.getSubjectsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(subjects => {
                  this.universitySubjects.set(cloneDeep(subjects));
                  this.selectedUniversitySubject.set(this.universitySubjects()!.find(s => s.id === this.selectedUniversitySubject()?.id));
               });
               
               this.universitiesService.getMajorsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(subjects => {
                  this.universityMajors.set(cloneDeep(subjects));
                  this.selectedUniversityMajor.set(this.universityMajors()!.find(s => s.id === this.selectedUniversityMajor()?.id));
                  this.selectedUniversityMajorSubjectGroup.set(undefined);
                  this.selectedUniversityMajorSubject.set(undefined);
               });
            }
         })
      ));
   }

   public back(): void {
      this.routerService.navigate(RouteUrls.ADMINISTRATION);
   }

   public saveAll(): void {
      this.universitiesService.saveAll(this.universitySubjects()!, this.universityMajors()!, this.university()!.id);
   }

   public selectSubject(subject: UniversitySubject): void {
      this.selectedUniversitySubject.set(subject === this.selectedUniversitySubject() ? undefined : subject);
   }

   public deleteSubject(subject: UniversitySubject): void {
      this.universitySubjects.set(this.universitySubjects()!.filter(s => s !== subject));
      if (this.selectedUniversitySubject() === subject) {
         this.selectedUniversitySubject.set(undefined);
      }
   }

   public saveSubject(subject: UniversitySubject): void {
      if(bypassFirebaseFreePlan) {
         this.saveAll();
         return;
      }
      this.universitiesService.saveSingleUniversitySubject(subject);
   }

   public selectMajor(major: UniversityMajor): void {
      this.selectedUniversityMajor.set(major === this.selectedUniversityMajor() ? undefined : major);
   }

   public addMajor(): void {
      const newMajor = {
         id: this.universityMajors()!.length.toString(),
         name: this.transloco.translate("ADMINISTRATION.UNIVERSITY_DETAILS.MAJOR_DETAILS.NEW_MAJOR_NAME"),
         universityId: this.university()!.id,
         facultyId: -1,
         subjectGroups: []
      };
      this.universityMajors.set([ ...this.universityMajors()!, newMajor ]);
      this.selectedUniversityMajor.set(newMajor);
   }

   public selectMajorSubject(group: UniversityMajorSubjectGroup, subjectCode: string): void {
      const subject = group.subjects.find(s => s.code === subjectCode);
      const cancelSelection = !subject || this.selectedUniversityMajorSubject() === subject;
      this.selectedUniversityMajorSubject.set(cancelSelection ? undefined : subject);
      this.selectedUniversityMajorSubjectGroup.set(cancelSelection ? undefined : group);
   }

   public deleteMajor(major: UniversityMajor): void {
      this.universityMajors.set(this.universityMajors()!.filter(m => m !== major));
      this.selectedUniversityMajor.set(undefined);
      this.selectedUniversityMajorSubjectGroup.set(undefined);
      this.selectedUniversityMajorSubject.set(undefined);
   }

   public saveMajor(major: UniversityMajor): void {
      this.universitiesService.saveSingleUniversityMajor(major);
   }

   public deleteGroupSubject(subject: UniversityMajorSubjectGroupSubject, group: UniversityMajorSubjectGroup): void {
      group.subjects = group.subjects.filter(s => s !== subject);
      this.selectedUniversityMajorSubject.set(undefined);
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

   public onMajorDataUpload(data: string, major: UniversityMajor): void {
      const newSubjects = NeptunExportParserUtils.parseUniversitySubjects(data, this.universitySubjects());
      if(newSubjects.length === 0) {
         this.onMajorSubjectGroupsUpload(data, major);
         return;
      }

      this.dialog.open(FileUploadDataConfirmationDialogComponent, {
         data: {
            data: newSubjects
         }
      }).afterClosed().subscribe((confirmed: boolean) => {
         if (confirmed) {
            this.onSubjectsUpload(newSubjects, () => {
               this.onMajorSubjectGroupsUpload(data, major);
            });
         }
      });
   }

   public getSubjectsParserFn() {
      return (exported: string) => NeptunExportParserUtils.parseUniversitySubjects(exported, this.universitySubjects());
   }

   public getMajorParserFn() {
      return (exported: string) => exported;
   }

   public trackByName(value: any): any {
      return value.name;
   }

   private onMajorSubjectGroupsUpload(data: string, major: UniversityMajor): void {
      const subjectGroups = NeptunExportParserUtils.parseUniversityMajor(data, this.universitySubjects()!);
      this.dialog.open(MajorUploadConfirmationDialogComponent, {
         data: {
            majorGroups: subjectGroups,
            subjects: this.universitySubjects()!
         }
      }).afterClosed().subscribe((confirmed: boolean) => {
         if(!confirmed) {
            return;
         }

         const newMajor = {
            ...major,
            subjectGroups
         };
         this.universityMajors.set([
            ...this.universityMajors()!.filter(m => m !== major),
            newMajor
         ]);
         this.selectedUniversityMajor.set(newMajor);
      });
   }
}
