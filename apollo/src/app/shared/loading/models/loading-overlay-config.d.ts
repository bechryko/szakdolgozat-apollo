import { LoadingType } from "../enums";

export interface LoadingOverlayConfig {
   key: Symbol;
   type: LoadingType;
}

export interface DisplayedLoadingOverlayConfig {
   type: LoadingType;
   animationType: string;
}
