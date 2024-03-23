import { Pipe, PipeTransform } from '@angular/core';
import { Language } from '../models';

@Pipe({
   name: 'languageLabelKey',
   standalone: true
})
export class LanguageLabelKeyPipe implements PipeTransform {
   public transform(lang: Language): string {
      return "LANGUAGES." + lang.toUpperCase();
   }
}
