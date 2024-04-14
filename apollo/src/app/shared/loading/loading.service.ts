import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoadingType } from './enums';
import { DisplayedLoadingOverlayConfig, LoadingOverlayConfig } from './models';

@Injectable({
   providedIn: 'root'
})
export class LoadingService {
   private static readonly OVERLAY_CLOSE_DELAY = 250;

   private readonly loadingJobConfigs: LoadingOverlayConfig[];
   private readonly currentConfig: WritableSignal<LoadingOverlayConfig | null>;

   public readonly config: Signal<DisplayedLoadingOverlayConfig | null>;

   constructor(
      private readonly spinnerService: NgxSpinnerService
   ) {
      this.loadingJobConfigs = [];
      this.currentConfig = signal(null);

      this.config = computed(() => {
         const config = cloneDeep(this.currentConfig() as any);
         if(config) {
            delete config.key;
         }
         return config;
      });
   }

   public startLoading(key: Symbol, type: LoadingType, fullscreen = true) { // TODO: timeout handling?
      if(this.loadingJobConfigs.some(config => config.key === key)) {
         return;
      }

      const config: LoadingOverlayConfig = { key, type, fullscreen };
      this.loadingJobConfigs.push(config);

      if(this.loadingJobConfigs.length === 1) {
         this.openLoadingOverlay();
         this.currentConfig.set(config);
      }
   }

   public finishLoading(key: Symbol) {
      const index = this.loadingJobConfigs.findIndex(config => config.key === key);
      if (index > -1) {
         this.loadingJobConfigs.splice(index, 1);
      }

      if (!this.loadingJobConfigs.length) {
         setTimeout(() => this.closeLoadingOverlay(), LoadingService.OVERLAY_CLOSE_DELAY);
      } else if (index === 0) {
         this.currentConfig.set(this.loadingJobConfigs[0]);
      }
   }

   private openLoadingOverlay() {
      this.spinnerService.show();
   }

   private closeLoadingOverlay() {
      if(this.loadingJobConfigs.length) {
         return;
      }

      this.spinnerService.hide();
      this.currentConfig.set(null);
   }
}
