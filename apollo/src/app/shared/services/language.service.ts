import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { defaultLanguage, languages } from '../constants';

const STORAGE_KEY = 'apollo-language';

@Injectable({
   providedIn: 'root'
})
export class LanguageService {
   private activeLanguage!: string;

   constructor(
      private readonly transloco: TranslocoService
   ) { }

   public setInitialLanguage(): void {
      this.setLanguage(localStorage.getItem(STORAGE_KEY) ?? defaultLanguage);
   }

   public setLanguage(lang: string): void {
      if(!languages.includes(lang)) {
         throw new Error(`Language ${lang} is not supported!`);
      }

      localStorage.setItem(STORAGE_KEY, lang);
      this.transloco.setActiveLang(lang);
      this.activeLanguage = lang;
   }

   public getLanguage(): string {
      return this.activeLanguage;
   }
}
