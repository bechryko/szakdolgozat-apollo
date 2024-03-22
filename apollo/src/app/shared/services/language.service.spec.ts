import { TestBed } from "@angular/core/testing";
import { TranslocoService } from "@ngneat/transloco";
import { defaultLanguage, languages } from "../constants";
import { LanguageService } from "./language.service";

describe('LanguageService', () => {
   let service: LanguageService;
   let translocoService: jasmine.SpyObj<TranslocoService>;
   let setLanguageSpy: jasmine.Spy;

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            LanguageService,
            {
               provide: TranslocoService,
               useValue: jasmine.createSpyObj('TranslocoService', ['setActiveLang'])
            }
         ]
      });

      service = TestBed.inject(LanguageService);
      translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
   });

   describe('setInitialLanguage', () => {
      beforeEach(() => {
         setLanguageSpy = spyOn(service, 'setLanguage');
      });

      it('should set the language from local storage if it is saved', () => {
         spyOn(localStorage, 'getItem').and.returnValue('en');

         service.setInitialLanguage();

         expect(setLanguageSpy).toHaveBeenCalledWith('en');
      });

      it('should set the app default language if no language is stored', () => {
         spyOn(localStorage, 'getItem').and.returnValue(null);

         service.setInitialLanguage();

         expect(setLanguageSpy).toHaveBeenCalledWith(defaultLanguage);
      });
   });

   describe('setLanguage', () => {
      it('should set the language in local storage, for TranslocoService and locally', () => {
         const language = languages[0];

         service.setLanguage(language);

         expect(localStorage.getItem('apollo-language')).toEqual(language);
         expect(translocoService.setActiveLang).toHaveBeenCalledWith(language);
         expect(service["activeLanguage"]).toEqual(language);
      });

      it('should throw an error if the language is not supported', () => {
         expect(() => service.setLanguage('not a language')).toThrowError();
      });
   });
});
