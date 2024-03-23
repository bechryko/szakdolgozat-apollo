import { ChangeDetectionStrategy, Component, Signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableModule } from '@angular/material/table';
import { LanguageLabelKeyPipe, MultiLanguage, MultiLanguagePipe, languages } from '@apollo/shared/languages';
import { University } from '@apollo/shared/models';
import { UniversitiesService } from '@apollo/shared/services';
import { TranslocoPipe } from '@ngneat/transloco';
import { FacultyCreationDialogComponent } from './dialogs';

@Component({
   selector: 'apo-admin-page',
   standalone: true,
   imports: [
      TranslocoPipe,
      MultiLanguagePipe,
      MatExpansionModule,
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatButtonModule,
      LanguageLabelKeyPipe
   ],
   templateUrl: './admin-page.component.html',
   styleUrl: './admin-page.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageComponent {
   public readonly availableLanguages = languages;
   public readonly columns = [...this.availableLanguages, 'remove'];

   public readonly universities: Signal<University[] | undefined>;

   @ViewChild(MatTable) private readonly facultyTable!: MatTable<MultiLanguage<string>>;

   constructor(
      private readonly universitiesService: UniversitiesService,
      private readonly dialog: MatDialog
   ) {
      this.universities = toSignal(this.universitiesService.universities$);
   }

   public addUniversity(): void {
      this.universitiesService.addUniversity();
   }

   public removeFaculty(faculties: MultiLanguage<string>[], element: MultiLanguage<string>): void {
      const index = faculties.indexOf(element);
      if(index !== -1) {
         faculties.splice(index, 1);
         this.updateFacultyTable();
      }
   }

   public addFaculty(university: University): void {
      this.dialog.open(FacultyCreationDialogComponent, {
         data: university.name
      }).afterClosed().subscribe((faculty: MultiLanguage<string> | undefined) => {
         if(!faculty) {
            return;
         }

         university.faculties.push(faculty);
         this.updateFacultyTable();
      });
   }

   public showUniversityDetails(university: University): void {
      console.log(university);
   }

   public saveChanges(): void {}

   private updateFacultyTable(): void {
      this.facultyTable.renderRows();
   }
}
