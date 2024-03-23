import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'languageLabelKey',
   standalone: true
})
export class LanguageLabelKeyPipe implements PipeTransform {
   public transform(lang: string): string {
      return "LANGUAGES." + lang.toUpperCase();
   }
}
