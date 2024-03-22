import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Signal, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header';
import { LanguageService } from './shared/services';
import { SidebarComponent } from './shared/sidebar';

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
export class AppComponent implements AfterViewInit {
   @ViewChild(HeaderComponent) private header?: HeaderComponent;
   public readonly isAdminPage: Signal<boolean>;
   private readonly isHeaderLoaded: WritableSignal<boolean>;

   constructor(
      private readonly languageService: LanguageService
   ) {
      this.languageService.setInitialLanguage();

      this.isHeaderLoaded = signal(false);

      this.isAdminPage = computed(() => {
         if(!this.isHeaderLoaded()) {
            return false;
         }

         return this.header!.selectedMenu() === "ADMINISTRATION";
      });
   }

   public ngAfterViewInit(): void {
      this.isHeaderLoaded.set(true);
   }
}
