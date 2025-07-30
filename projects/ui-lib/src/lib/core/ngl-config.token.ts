import { InjectionToken } from '@angular/core';


export interface NglConfig {
  baseApiUrl: string;
  enableUnsavedChangesWarning: boolean;
  enableDevTools: boolean;
}

export const NGL_CONFIG = new InjectionToken<NglConfig>('NGL_CONFIG');
