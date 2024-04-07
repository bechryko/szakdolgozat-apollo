import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { bypassFirebaseFreePlan } from '@apollo/shared/constants';
import { FileUploadComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University, UniversityMajor, UniversitySubject } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { RouterService, UniversitiesService } from '@apollo/shared/services';
import { TranslocoService } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { filter, map } from 'rxjs';

@Component({
   selector: 'apo-admin-university',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MultiLanguagePipe,
      MatTabsModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      FileUploadComponent,
      MatSelectModule,
      MatCheckboxModule
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

      this.university = toSignal(this.activatedRoute.data.pipe(
         map(({ university }) => {
            if (university) {
               this.universitiesService.getSubjectsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(subjects => {
                  this.universitySubjects.set(cloneDeep(subjects));
                  this.selectedUniversitySubject.set(this.universitySubjects()!.find(s => s.id === this.selectedUniversitySubject()?.id));
               });
               
               this.universitiesService.getMajorsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(majors => {
                  this.universityMajors.set(cloneDeep(majors));
                  this.universityMajors()!.forEach(major => {
                     if(!major.stateScholarshipRequiredAverage) {
                        major.stateScholarshipRequiredAverage = undefined;
                     }
                  });
                  this.selectedUniversityMajor.set(this.universityMajors()!.find(s => s.id === this.selectedUniversityMajor()?.id));
               });
            }

            return university;
         }),
         filter(Boolean)
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
      const newMajor: UniversityMajor = {
         id: this.universityMajors()!.length.toString(),
         name: this.transloco.translate("ADMINISTRATION.UNIVERSITY_DETAILS.NEW_MAJOR_NAME"),
         universityId: this.university()!.id,
         facultyId: -1,
         subjectGroups: []
      };
      this.universityMajors.set([ ...this.universityMajors()!, newMajor ]);
      this.selectedUniversityMajor.set(newMajor);
   }

   public deleteMajor(major: UniversityMajor): void {
      this.universityMajors.set(this.universityMajors()!.filter(m => m !== major));
      this.selectedUniversityMajor.set(undefined);
   }

   public saveMajor(major: UniversityMajor): void {
      this.universitiesService.saveSingleUniversityMajor(major);
   }

   public openMajorDetails(major: UniversityMajor): void {
      this.routerService.navigate(RouteUrls.ADMIN_MAJOR, this.university()!.id, major.id);
   }

   public onSubjectsUpload(data: RawUniversitySubject[]): void { // TODO: forced upload dialog (file upload component input field)
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
      });
   }

   public getSubjectsParserFn() {
      return (exported: string) => NeptunExportParserUtils.parseUniversitySubjects(exported, this.universitySubjects());
   }
}
