import { Pipe, PipeTransform } from '@angular/core';
import { fallbackLanguage } from '../constants';
import { MultiLanguage } from '../models';
import { LanguageService } from '../services';

@Pipe({
   name: 'multiLanguage',
   standalone: true
})
export class MultiLanguagePipe implements PipeTransform {
   constructor(
      private readonly languageService: LanguageService
   ) { }

   public transform<T>(value: MultiLanguage<T>): T {
      const translation = value[this.languageService.getLanguage()];
      return translation ?? value[fallbackLanguage]!;
   }
}
