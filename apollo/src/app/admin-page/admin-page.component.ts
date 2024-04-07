import { ChangeDetectionStrategy, Component, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableModule } from '@angular/material/table';
import { RouteUrls } from '@apollo/app.routes';
import { LanguageLabelKeyPipe, MultiLanguage, MultiLanguagePipe, languages } from '@apollo/shared/languages';
import { University } from '@apollo/shared/models';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { RouterService, UniversitiesService } from '@apollo/shared/services';
import { cloneDeep } from 'lodash';
import { Observable, tap } from 'rxjs';

@Component({
   selector: 'apo-admin-page',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MultiLanguagePipe,
      MatExpansionModule,
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      LanguageLabelKeyPipe,
      FormsModule
   ],
   templateUrl: './admin-page.component.html',
   styleUrl: './admin-page.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageComponent {
   public readonly availableLanguages = languages;
   public readonly columns = [...this.availableLanguages, 'remove'];

   public readonly universities$: Observable<University[]>;
   public universities: University[];

   @ViewChildren(MatTable) private readonly facultyTables?: MatTable<MultiLanguage<string>>[];

   constructor(
      private readonly universitiesService: UniversitiesService,
      private readonly routerService: RouterService
   ) {
      this.universities = [];

      this.universities$ = this.universitiesService.universities$.pipe(
         tap(universities => {
            if(!universities) {
               return;
            }
            
            this.universities = cloneDeep(universities);
            this.updateFacultyTables();
         })
      );
   }

   public addUniversity(): void {
      this.universitiesService.addUniversity();
   }

   public removeFaculty(faculties: MultiLanguage<string>[], element: MultiLanguage<string>): void {
      const index = faculties.indexOf(element);
      if(index !== -1) {
         faculties.splice(index, 1);
         this.updateFacultyTables();
      }
   }

   public addFaculty(university: University): void {
      const highestId = university.faculties.reduce((max, faculty) => Math.max(max, faculty.id), -1);
      university.faculties.push({
         id: highestId + 1,
         ...Object.fromEntries(
            this.availableLanguages.map(lang => [lang, ''])
         )
      });
      this.updateFacultyTables();
   }

   public showUniversityDetails(university: University): void {
      this.routerService.navigate(RouteUrls.ADMIN_UNIVERSITY, university.id);
   }

   public saveChanges(): void {
      this.universitiesService.saveUniversities(this.universities);
   }

   private updateFacultyTables(): void {
      if(!this.facultyTables) {
         return;
      }
      this.facultyTables.forEach(table => table.renderRows());
   }
}
