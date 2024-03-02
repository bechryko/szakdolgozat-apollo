import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@apollo-shared/header';
import { LanguageService } from '@apollo-shared/services';
import { SidebarComponent } from '@apollo-shared/sidebar';

@Component({
   selector: 'apo-root',
   standalone: true,
   imports: [
      CommonModule,
      RouterOutlet,
      HeaderComponent,
      SidebarComponent
   ],
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
   constructor(
      private readonly languageService: LanguageService
   ) {
      this.languageService.setInitialLanguage();
   }
}
