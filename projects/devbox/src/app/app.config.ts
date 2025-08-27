import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideEnvironmentInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAngularSvgIcon, provideNgxMask } from 'projects/ui-lib/src/public-api';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideUiLibConfig, UiLibService } from 'projects/ui-lib/src/provide-ui-lib-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideNgxMask(),
    provideAngularSvgIcon(),
    provideUiLibConfig({
      tailwindTheme: {
        fonts: { inter: '"Roboto", "sans-serif"' },
        colors: {
          primary: {
            50: '#ecfdf0',
            100: '#d1fadd',
            200: '#a4f4ba',
            300: '#70e68e',
            400: '#42d863',
            500: '#25cc2d',
            600: '#1ea626',
            700: '#197f1f',
            800: '#145918',
            900: '#0f3a12',
          },
          success: { 50: '#ecfdf5', 100: '#d1fae5' },
        },
        shadows: { 1: '0 3px 12px rgba(0, 0, 0, 0.1)', 2: '0 5px 15px rgba(0, 0, 0, 0.15)' },
        typography: {
          h1: { size: '5.5rem', lineHeight: '6.5rem', letterSpacing: '-0.08rem', fontWeight: 400 },
          h2: { size: '3.5rem', lineHeight: '4rem', letterSpacing: '-0.02rem', fontWeight: 400 },
        },
      },
    }),
    provideEnvironmentInitializer(() => {
      const uiLibService = inject(UiLibService);
      return uiLibService.applyTailwindTheme();
    }),
  ],
};
