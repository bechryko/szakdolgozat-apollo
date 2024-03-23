import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { defaultLanguage } from '../constants/default-language';
import { Language } from '../models';

const STORAGE_KEY = 'apollo-language';

@Injectable({
   providedIn: 'root'
})
export class LanguageService {
   private activeLanguage!: Language;
   public readonly activeLanguage$: Observable<Language>;

   constructor(
      private readonly transloco: TranslocoService
   ) {
      this.activeLanguage$ = this.transloco.langChanges$ as Observable<Language>;
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
