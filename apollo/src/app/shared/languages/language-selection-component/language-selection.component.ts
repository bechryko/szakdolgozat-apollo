import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { ApolloCommonModule } from '@apollo/shared/modules';
import { languages } from '../constants/languages';
import { Language } from '../models';
import { LanguageService } from '../services/language.service';

@Component({
   selector: 'apo-language-selection',
   standalone: true,
   imports: [
      ApolloCommonModule,
      MatSelectModule
   ],
   templateUrl: './language-selection.component.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectionComponent {
   @Output() public readonly selectLanguage = new EventEmitter<Language>();
   public readonly availableLanguages = languages;
   public previousLanguage: Language;

   constructor(
      private readonly languageService: LanguageService
   ) {
      this.previousLanguage = this.languageService.getLanguage();
   }

   public onSelectLanguage(lang: Language): void {
      this.languageService.setLanguage(lang);
      this.selectLanguage.emit(lang);
   }
}
