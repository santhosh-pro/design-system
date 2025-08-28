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
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
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
