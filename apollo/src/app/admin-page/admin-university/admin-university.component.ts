import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { GeneralInputDialogComponent } from '@apollo/shared/components';
import { FileUploadComponent, NeptunExportParserUtils } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University, UniversitySubject } from '@apollo/shared/models';
import { RouterService, UniversitiesService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';
import { NgLetModule } from 'ng-let';
import { map, tap } from 'rxjs';

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
      FileUploadComponent
   ],
   templateUrl: './admin-university.component.html',
   styleUrl: './admin-university.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUniversityComponent {
   public readonly university: Signal<University | undefined>;

   public readonly universitySubjects: WritableSignal<UniversitySubject[] | undefined>;
   public readonly selectedUniversitySubject: WritableSignal<UniversitySubject | undefined>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly routerService: RouterService,
      private readonly universitiesService: UniversitiesService,
      private readonly dialog: MatDialog
   ) {
      this.universitySubjects = signal(undefined);
      this.selectedUniversitySubject = signal(undefined);

      this.university = toSignal(this.activatedRoute.data.pipe(
         map(({ university }) => university),
         tap(university => {
            if(university) {
               this.universitiesService.getSubjectsForUniversity(university.id).pipe(
                  takeUntilDestroyed()
               ).subscribe(subjects => {
                  this.universitySubjects.set(cloneDeep(subjects));
                  this.selectedUniversitySubject.set(this.universitySubjects()!.find(s => s.id === this.selectedUniversitySubject()?.id));
               });
            }
         })
      ));
   }

   public back(): void {
      this.routerService.navigate(RouteUrls.ADMINISTRATION);
   }

   public saveAll(): void {
      this.universitiesService.saveUniversitySubjects(this.universitySubjects()!, this.university()!.id);
   }

   public selectSubject(subject: UniversitySubject): void {
      this.selectedUniversitySubject.set(subject === this.selectedUniversitySubject() ? undefined : subject);
   }

   public deleteSubject(subject: UniversitySubject): void {
      this.universitySubjects.set(this.universitySubjects()!.filter(s => s !== subject));
      if(this.selectedUniversitySubject() === subject) {
         this.selectedUniversitySubject.set(undefined);
      }
   }

   public saveSubject(subject: UniversitySubject): void {
      this.universitiesService.saveSingleUniversitySubject(subject);
   }

   public onDataUpload(data: RawUniversitySubject[]): void { // TODO: forced upload dialog (file upload component input field)
      this.dialog.open(GeneralInputDialogComponent, {
         data: {
            title: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.TITLE",
            description: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.DESCRIPTION",
            inputType: 'text',
            inputLabel: "ADMINISTRATION.UNIVERSITY_DETAILS.UPLOAD_SUBJECTS_LANGUAGE_DIALOG.LANGUAGE_LABEL"
         }
      }).afterClosed().subscribe(language => {
         if(!language) {
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
