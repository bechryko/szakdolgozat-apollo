import { MultiLanguage } from "../models";
import { LanguageService } from "../services";
import { MultiLanguagePipe } from "./multi-language.pipe";

describe('MultiLanguagePipe', () => {
   let pipe: MultiLanguagePipe;
   let languageService: jasmine.SpyObj<LanguageService>;

   beforeEach(() => {
      languageService = jasmine.createSpyObj('LanguageService', ['getLanguage']);
      pipe = new MultiLanguagePipe(languageService);
   });

   it('should transform correctly', () => {
      const value: MultiLanguage<string> = {
         en: 'testEn',
         hu: 'testHu'
      };

      languageService.getLanguage.and.returnValue('en');
      expect(pipe.transform(value)).toBe('testEn');

      languageService.getLanguage.and.returnValue('hu');
      expect(pipe.transform(value)).toBe('testHu');
   });

   it('should return the fallback translation if the current language is not present', () => {
      const value: MultiLanguage<string> = {
         en: 'testEn'
      };

      languageService.getLanguage.and.returnValue('hu');
      expect(pipe.transform(value)).toBe('testEn');
   });
});
