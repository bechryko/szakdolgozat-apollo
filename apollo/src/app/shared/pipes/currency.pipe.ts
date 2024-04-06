import { Pipe, PipeTransform } from '@angular/core';
import { round } from 'lodash';
import { separateDigits } from '../functions';
import { LanguageService } from '../languages';

@Pipe({
   name: 'apoCurrency',
   standalone: true
})
export class CurrencyPipe implements PipeTransform {
   private readonly hufToEur = 0.0025;

   constructor(
      private readonly languageService: LanguageService
   ) { }

   public transform(valueInHuf: number): string {
      const language = this.languageService.getLanguage();

      switch (language) {
         case 'hu':
            return `${ separateDigits(round(valueInHuf)) } Ft`;
         default:
            return `€${ round(valueInHuf * this.hufToEur, 3) }`;
      }
   }
}
