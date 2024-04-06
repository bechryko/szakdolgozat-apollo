import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatChipListboxChange } from "@angular/material/chips";
import { provideTransloco } from "@ngneat/transloco";
import { LanguageService } from "../services";
import { LanguageSelectionComponent } from "./language-selection.component";

describe('LanguageSelectionComponent', () => {
   let component: LanguageSelectionComponent;
   let fixture: ComponentFixture<LanguageSelectionComponent>;
   let languageService: jasmine.SpyObj<LanguageService>;

   function languageServiceFactory() {
      return {
         ...jasmine.createSpyObj<LanguageService>('LanguageService', ['setLanguage']),
         getLanguage: () => 'en'
      };
   }
   
   beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
         imports: [LanguageSelectionComponent],
         providers: [
            provideTransloco({ config: {} }),
            {
               provide: LanguageService,
               useFactory: languageServiceFactory
            }
         ]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(LanguageSelectionComponent);
      component = fixture.componentInstance;

      languageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
      
      fixture.detectChanges();
   });

   describe('onSelectLanguage', () => {
      it("should set a new selected language", () => {
         const newLanguage = 'hu';
         const event = {
            value: newLanguage,
            source: {}
         } as MatChipListboxChange;

         component.onSelectLanguage(event);

         expect(component.selectedLanguage).toEqual(newLanguage);
         expect(languageService.setLanguage).toHaveBeenCalledWith(newLanguage);
      });

      it("should set the latest selected language if the user tries to unselect the current language", () => {
         const event = {
            value: null,
            source: {}
         } as MatChipListboxChange;

         component.onSelectLanguage(event);

         expect(component.selectedLanguage).toEqual('en');
         expect(languageService.setLanguage).not.toHaveBeenCalled();
         expect(event.source.value).toEqual('en');
      });
   });
});
