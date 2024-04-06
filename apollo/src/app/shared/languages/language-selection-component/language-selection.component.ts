import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { TranslocoPipe } from '@ngneat/transloco';
import { languages } from '../constants/languages';
import { LanguageService } from '../services/language.service';

@Component({
   selector: 'apo-language-selection',
   standalone: true,
   imports: [
      TranslocoPipe,
      MatChipsModule
   ],
   templateUrl: './language-selection.component.html',
   styleUrl: './language-selection.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectionComponent {
   @Output() public readonly selectLanguage = new EventEmitter<string>();
   public readonly availableLanguages = languages;
   public selectedLanguage: string;

   constructor(
      private readonly languageService: LanguageService
   ) {
      this.selectedLanguage = languageService.getLanguage();
   }

   public onSelectLanguage(event: MatChipListboxChange): void {
      const language = event.value;
      if(!language) {
         event.source.value = this.selectedLanguage;
         return;
      }

      this.selectedLanguage = language;
      this.languageService.setLanguage(language);
      this.selectLanguage.emit(language);
   }
}
