import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { RouteUrls } from '@apollo/app.routes';
import { FileUploadComponent } from '@apollo/shared/file-upload';
import { MultiLanguagePipe } from '@apollo/shared/languages';
import { RawUniversitySubject, University } from '@apollo/shared/models';
import { RouterService } from '@apollo/shared/services';
import { NeptunExportParserUtils } from '@apollo/shared/utils';
import { TranslocoPipe } from '@ngneat/transloco';
import { cloneDeep } from 'lodash';

@Component({
   selector: 'apo-admin-university',
   standalone: true,
   imports: [
      TranslocoPipe,
      CommonModule,
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
export class AdminUniversityComponent implements OnInit {
   public readonly university: WritableSignal<University | null>;

   constructor(
      private readonly activatedRoute: ActivatedRoute,
      private readonly routerService: RouterService
   ) {
      this.university = signal(null);
   }

   public ngOnInit(): void {
      this.activatedRoute.data.subscribe(({ university }) => {
         this.university.set(cloneDeep(university));
      });
   }

   public back(): void {
      this.routerService.navigate(RouteUrls.ADMINISTRATION);
   }

   public onDataUpload(data: RawUniversitySubject[]): void {
      console.log(data)
   }

   public subjectsParserFn(exported: string): RawUniversitySubject[] {
      return NeptunExportParserUtils.parseUniversitySubjects(exported);
   }
}
