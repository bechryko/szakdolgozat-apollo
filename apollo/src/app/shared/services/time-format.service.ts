import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { LanguageService } from '../languages';

@Injectable({
   providedIn: 'root'
})
export class TimeFormatService {
   constructor(
      private readonly languageService: LanguageService
   ) { }

   public format(value: Date): [string, string] {
      return formatDate(value, this.getFormat(), 'en-US').split('%') as [string, string];
   }

   private getFormat(): string {
      if(this.languageService.getLanguage() === 'hu') {
         return 'yyyy. MM. dd.%HH:mm:ss';
      } else {
         return 'MMMM d, y%h:mm:ss a';
      }
   }
}
