import { TestBed } from "@angular/core/testing";
import { NgxSpinnerService } from "ngx-spinner";
import { LoadingType } from "./enums";
import { LoadingService } from "./loading.service";

describe('LoadingService', () => {
   let service: LoadingService;
   let spinnerService: jasmine.SpyObj<NgxSpinnerService>;

   const testLoadingKey1 = Symbol("testLoadingKey1");
   const testLoadingKey2 = Symbol("testLoadingKey2");

   function waitForOverlayClose(testCallback: Function, done: DoneFn) {
      setTimeout(() => {
         testCallback();
         done();
      }, LoadingService['OVERLAY_CLOSE_DELAY'] + 1);
   }

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [
            LoadingService,
            {
               provide: NgxSpinnerService,
               useValue: jasmine.createSpyObj('SpinnerService', ['show', 'hide'])
            }
         ]
      });

      service = TestBed.inject(LoadingService);
      spinnerService = TestBed.inject(NgxSpinnerService) as jasmine.SpyObj<NgxSpinnerService>;
   });

   describe('startLoading', () => {
      it("should open loading overlay and set the current config if there are no other loading jobs", () => {
         service.startLoading(testLoadingKey1, LoadingType.LOAD);

         expect(spinnerService.show).toHaveBeenCalled();
         expect(service.config()).toEqual({ type: LoadingType.LOAD, animationType: jasmine.any(String) });
      });

      it("should not open loading overlay and set the current config if there are other loading jobs", () => {
         service['loadingJobConfigs'].push({ key: testLoadingKey1, type: LoadingType.LOAD });
         service.startLoading(testLoadingKey2, LoadingType.LOAD);

         expect(spinnerService.show).not.toHaveBeenCalled();
         expect(service.config()).toBeNull();
      });

      it("should not open loading overlay and set the current config if the loading job is already started", () => {
         service['loadingJobConfigs'].push({ key: testLoadingKey1, type: LoadingType.LOAD });
         service.startLoading(testLoadingKey1, LoadingType.SAVE);

         expect(spinnerService.show).not.toHaveBeenCalled();
         expect(service['loadingJobConfigs']).toEqual([{ key: testLoadingKey1, type: LoadingType.LOAD }]);
      });
   });

   describe('finishLoading', () => {
      it("should close loading overlay if the loading job is finished", done => {
         service['loadingJobConfigs'].push({ key: testLoadingKey1, type: LoadingType.LOAD });
         service.finishLoading(testLoadingKey1);

         waitForOverlayClose(() => {
            expect(spinnerService.hide).toHaveBeenCalled();
            expect(service.config()).toBeNull();
         }, done);
      });

      it("should not close loading overlay if there are other loading jobs", () => {
         service['loadingJobConfigs'].push({ key: testLoadingKey1, type: LoadingType.LOAD });
         service['loadingJobConfigs'].push({ key: testLoadingKey2, type: LoadingType.SAVE });
         service.finishLoading(testLoadingKey1);

         expect(spinnerService.hide).not.toHaveBeenCalled();
         expect(service.config()).toEqual({ type: LoadingType.SAVE, animationType: jasmine.any(String) });
      });

      it("should not close loading overlay if the loading job is not started", () => {
         service.finishLoading(testLoadingKey1);

         expect(spinnerService.hide).not.toHaveBeenCalled();
         expect(service.config()).toBeNull();
      });
   });

   describe('config', () => {
      it("should return null if there are no loading jobs", done => {
         expect(service.config()).toBeNull();

         service.startLoading(testLoadingKey1, LoadingType.LOAD);
         service.finishLoading(testLoadingKey1);

         waitForOverlayClose(() => {
            expect(service.config()).toBeNull();
         }, done);
      });

      it("should not change animation when adding a new job", () => {
         service.startLoading(testLoadingKey1, LoadingType.LOAD);
         const animationType = service.config()?.animationType;

         service.startLoading(testLoadingKey2, LoadingType.SAVE);

         expect(animationType).not.toBeNull();
         expect(service.config()?.animationType).toEqual(animationType);
      });
   });
});
