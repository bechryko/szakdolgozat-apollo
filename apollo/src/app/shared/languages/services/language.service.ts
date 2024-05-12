import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { defaultLanguage } from '../constants/default-language';
import { Language } from '../models';

const STORAGE_KEY = 'apollo-language';

@Injectable({
   providedIn: 'root'
})
export class LanguageService {
   private activeLanguage!: Language;

   constructor(
      private readonly transloco: TranslocoService
   ) {
      this.setInitialLanguage();
   }

   public setInitialLanguage(): void {
      this.setLanguage(localStorage.getItem(STORAGE_KEY) as Language ?? defaultLanguage);
   }

   public setLanguage(lang: Language): void {
      localStorage.setItem(STORAGE_KEY, lang);
      this.transloco.setActiveLang(lang);
      this.activeLanguage = lang;
   }

   public getLanguage(): Language {
      return this.activeLanguage;
   }
}
