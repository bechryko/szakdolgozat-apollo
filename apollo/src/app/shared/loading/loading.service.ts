import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoadingType } from './enums';
import { DisplayedLoadingOverlayConfig, LoadingOverlayConfig } from './models';

@Injectable({
   providedIn: 'root'
})
export class LoadingService {
   private readonly loadingKeys: LoadingOverlayConfig[];
   private readonly currentConfig: WritableSignal<LoadingOverlayConfig | null>;

   public readonly config: Signal<DisplayedLoadingOverlayConfig | null>;

   constructor(
      private readonly spinnerService: NgxSpinnerService
   ) {
      this.loadingKeys = [];
      this.currentConfig = signal(null);

      this.config = computed(() => {
         const config = cloneDeep(this.currentConfig() as any);
         if(config) {
            delete config.key;
         }
         return config;
      });
   }

   public startLoading(key: Symbol, type: LoadingType, fullscreen = true) {
      const config: LoadingOverlayConfig = { key, type, fullscreen };
      this.loadingKeys.push(config);

      if(this.loadingKeys.length === 1) {
         this.openLoadingOverlay();
         this.currentConfig.set(config);
      }
   }

   public finishLoading(key: Symbol) {
      const index = this.loadingKeys.findIndex(loadingKey => loadingKey.key === key);
      if (index > -1) {
         this.loadingKeys.splice(index, 1);
      }

      if (!this.loadingKeys.length) {
         this.closeLoadingOverlay();
         this.currentConfig.set(null);
      } else if (index === 0) {
         this.currentConfig.set(this.loadingKeys[0]);
      }
   }

   private openLoadingOverlay() {
      this.spinnerService.show();
   }

   private closeLoadingOverlay() {
      this.spinnerService.hide();
   }
}
