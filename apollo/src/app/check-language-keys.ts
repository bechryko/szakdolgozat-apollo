import { languages } from "@apollo/shared/constants";
import { Translation, TranslocoLoader } from "@ngneat/transloco";
import { Observable, map, merge } from "rxjs";

export function checkLanguageKeys(loader: TranslocoLoader): void {
   const translations: Record<string, Translation> = {};
   const translationKeys: Set<string> = new Set();

   const translations$: Observable<{ lang: string; translation: Translation}>[] = languages.map(lang => (loader.getTranslation(lang) as any).pipe(
      map(translation => ({ lang, translation }))
   ));

   merge(...translations$).subscribe({
      next: translation => {
         translations[translation.lang] = translation.translation;
         extractTranslationKeys(translation.translation).forEach(key => translationKeys.add(key));
      },
      complete: () => {
         let hasMissingKeys = false;
         for(const lang in translations) {
            const keys = extractTranslationKeys(translations[lang]);
            const missingKeys = Array.from(translationKeys).filter(key => !keys.includes(key));
            hasMissingKeys ||= missingKeys.length > 0;

            missingKeys.forEach(key => console.warn(`Missing translation key "${key}" in language "${lang}"!`));
         }

         if(!hasMissingKeys) {
            console.log("All translation keys are present in all languages.");
         }
      }
   });
}

function extractTranslationKeys(translation: Translation): string[] {
   const keys: string[] = [];

   for(const key in translation) {
      keys.push(key);
   }

   return keys;
}
