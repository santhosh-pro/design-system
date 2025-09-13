import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideEnvironmentInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAngularSvgIcon, provideFormErrors, provideNgxMask } from 'projects/ui-lib/src/public-api';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideUiLibConfig, UiLibService } from 'projects/ui-lib/src/public-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideNgxMask(),
    provideAngularSvgIcon(),
    provideFormErrors(),
    provideUiLibConfig({
      tailwindTheme: {
        fonts: { inter: '"Roboto", "sans-serif"' },
        colors: {
         primary: {
  50:  '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
},
          success: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
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
