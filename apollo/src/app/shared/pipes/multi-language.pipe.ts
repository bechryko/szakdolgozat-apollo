import { Pipe, PipeTransform } from '@angular/core';
import { MultiLanguage } from '@apollo-shared/models';
import { LanguageService } from '@apollo-shared/services';

@Pipe({
   name: 'multiLanguage',
   standalone: true
})
export class MultiLanguagePipe implements PipeTransform {
   constructor(
      private readonly languageService: LanguageService
   ) { }

   public transform<T>(value: MultiLanguage<T>): T {
      return value[this.languageService.getLanguage()];
   }
}
