import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
   providedIn: 'root'
})
export class LanguageService {
   private readonly defaultLanguage = 'en';
   private activeLanguage!: string;

   constructor(
      private readonly transloco: TranslocoService
   ) { }

   public setInitialLanguage(): void {
      this.setLanguage(this.defaultLanguage);
   }

   public setLanguage(lang: string): void {
      this.transloco.setActiveLang(lang);
      this.activeLanguage = lang;
   }

   public getLanguage(): string {
      return this.activeLanguage;
   }
}
