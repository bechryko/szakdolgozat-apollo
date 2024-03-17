import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@ngneat/transloco';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { firebaseConfig } from './firebase.config';
import { defaultLanguage, languages } from './shared/constants';
import { CompletionsEffects, UserEffects, coreFeature } from './shared/store';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
   providers: [
      provideRouter(routes),
      provideAnimationsAsync(),
      importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
      importProvidersFrom(provideAuth(() => getAuth())),
      importProvidersFrom(provideFirestore(() => getFirestore())),
      provideStore(),
      provideState(coreFeature),
      provideEffects(CompletionsEffects, UserEffects),
      provideHttpClient(),
      provideTransloco({
         config: {
            availableLangs: languages,
            defaultLang: defaultLanguage,
            fallbackLang: defaultLanguage, // TODO: fallbacks doesn't work
            missingHandler: {
               useFallbackTranslation: true
            },
            reRenderOnLangChange: true,
            prodMode: !isDevMode(),
         },
         loader: TranslocoHttpLoader
      })]
};
