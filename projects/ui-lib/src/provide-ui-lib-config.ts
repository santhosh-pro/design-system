import {Provider} from '@angular/core';
import { InjectionToken } from '@angular/core';

export interface UiLibConfig {
  enableUnsavedChangesWarning: boolean;
  enableDevTools: boolean;
}

export const UI_LIB_CONFIG = new InjectionToken<UiLibConfig>('UI_LIB_CONFIG');


export function provideUiLibConfig(config: UiLibConfig): Provider {
  return {
    provide: UI_LIB_CONFIG,
    useValue: config
  };
}

import {inject, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiLibService {

  private config = inject(UI_LIB_CONFIG);

  constructor() {
  }

}


