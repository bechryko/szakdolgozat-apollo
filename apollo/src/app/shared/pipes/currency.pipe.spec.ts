import { LanguageService } from "../languages";
import { CurrencyPipe } from "./currency.pipe";

describe('CurrencyPipe', () => {
   let pipe: CurrencyPipe;
   let languageService: jasmine.SpyObj<LanguageService>;

   beforeEach(() => {
      languageService = jasmine.createSpyObj('LanguageService', ['getLanguage']);
      pipe = new CurrencyPipe(languageService);
   });

   it("should return the value in HUF with the currency symbol Ft if the current language is Hungarian", () => {
      languageService.getLanguage.and.returnValue('hu');

      const result = pipe.transform(1000);

      expect(result).toBe('1 000 Ft');
   });

   it("should return the value in EUR with the currency symbol € if the current language is not Hungarian", () => {
      languageService.getLanguage.and.returnValue('en');

      const result = pipe.transform(1000);

      expect(result).toBe('€2.5');
   });
});
