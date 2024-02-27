import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly defaultLanguage = 'en';

  constructor(
    private readonly translocoService: TranslocoService
  ) { }

  public setInitialLanguage(): void {
    this.setLanguage(this.defaultLanguage);
  }

  public setLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }
}
