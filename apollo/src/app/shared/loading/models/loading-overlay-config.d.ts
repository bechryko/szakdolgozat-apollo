import { LoadingType } from "../enums";

export interface LoadingOverlayConfig {
   key: Symbol;
   type: LoadingType;
   fullscreen: boolean;
}

export interface DisplayedLoadingOverlayConfig extends Omit<LoadingOverlayConfig, 'key'> {}
