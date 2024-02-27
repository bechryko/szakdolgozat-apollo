import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@ngneat/transloco';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), importProvidersFrom(provideFirebaseApp(() => initializeApp({ "projectId": "szakdolgozat-apollo", "appId": "1:738565177828:web:33b49c4e5c668c55c407f1", "storageBucket": "szakdolgozat-apollo.appspot.com", "apiKey": "AIzaSyDJmrexsnnqsI978-9q-bfpeP3ddRa0TP8", "authDomain": "szakdolgozat-apollo.firebaseapp.com", "messagingSenderId": "738565177828" }))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())), provideStore(), provideEffects(), provideHttpClient(), provideTransloco({
        config: { 
          availableLangs: ['hu', 'en'],
          defaultLang: 'hu',
          // Remove this option if your application doesn't support changing language in runtime.
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      })]
};
