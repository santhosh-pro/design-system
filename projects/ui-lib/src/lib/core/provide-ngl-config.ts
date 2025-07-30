import {Provider} from '@angular/core';
import {NGL_CONFIG, NglConfig} from './ngl-config.token';

export function provideNglConfig(config: NglConfig): Provider {
  return {
    provide: NGL_CONFIG,
    useValue: config
  };
}
