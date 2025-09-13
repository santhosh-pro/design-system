import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Provider, InjectionToken, inject, Injectable } from '@angular/core';

export interface UiLibConfig {
  tailwindTheme?: {
    fonts?: { inter?: string };
    colors?: {
      primary?: { [key: string]: string };
      success?: { [key: string]: string };
      info?: { [key: string]: string };
      warning?: { [key: string]: string };
      error?: { [key: string]: string };
    };
    shadows?: { [key: string]: string };
    typography?: {
      [key: string]: { size?: string; lineHeight?: string; letterSpacing?: string; fontWeight?: number | string };
    };
  };
}

export const UI_LIB_CONFIG = new InjectionToken<UiLibConfig>('UI_LIB_CONFIG');

type ColorCategory = 'primary' | 'success' | 'info' | 'warning' | 'error';

export function provideUiLibConfig(config: UiLibConfig): Provider {
  return {
    provide: UI_LIB_CONFIG,
    useValue: config,
  };
}

@Injectable({
  providedIn: 'root',
})
export class UiLibService {
  private config = inject(UI_LIB_CONFIG);
  private platformId = inject(PLATFORM_ID);

  applyTailwindTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Skipping theme application on server (SSR)');
      return;
    }

    const theme = this.config.tailwindTheme;
    if (!theme) {
      console.warn('No tailwindTheme provided in UiLibConfig');
      return;
    }

    // Apply colors with proper CSS variable names for Tailwind 4
    const colorCategories: ColorCategory[] = ['primary', 'success', 'info', 'warning', 'error'];
    colorCategories.forEach((category) => {
      const colors = theme.colors?.[category];
      if (colors) {
        Object.entries(colors).forEach(([shade, value]) => {
          // Use both formats for compatibility
          document.documentElement.style.setProperty(`--color-${category}-${shade}`, value);
          document.documentElement.style.setProperty(`--tw-color-${category}-${shade}`, value);
          console.log(`Set --color-${category}-${shade}: ${value}`);
        });
      }
    });

    // Apply fonts
    if (theme.fonts?.inter) {
      document.documentElement.style.setProperty('--font-inter', theme.fonts.inter);
      document.documentElement.style.setProperty('--tw-font-inter', theme.fonts.inter);
      console.log('Set --font-inter:', theme.fonts.inter);
    }

    // Apply shadows
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--shadow-${key}`, value);
        document.documentElement.style.setProperty(`--tw-shadow-${key}`, value);
        console.log(`Set --shadow-${key}: ${value}`);
      });
    }

    // Apply typography
    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, props]) => {
        if (props.size) {
          document.documentElement.style.setProperty(`--text-${key}-size`, props.size);
          document.documentElement.style.setProperty(`--tw-text-${key}-size`, props.size);
        }
        if (props.lineHeight) {
          document.documentElement.style.setProperty(`--text-${key}-line-height`, props.lineHeight);
          document.documentElement.style.setProperty(`--tw-text-${key}-line-height`, props.lineHeight);
        }
        if (props.letterSpacing) {
          document.documentElement.style.setProperty(`--text-${key}-letter-spacing`, props.letterSpacing);
          document.documentElement.style.setProperty(`--tw-text-${key}-letter-spacing`, props.letterSpacing);
        }
        if (props.fontWeight) {
          document.documentElement.style.setProperty(`--text-${key}-font-weight`, props.fontWeight.toString());
          document.documentElement.style.setProperty(`--tw-text-${key}-font-weight`, props.fontWeight.toString());
        }
        console.log(`Set typography for ${key}:`, props);
      });
    }

    // Debug: Check if variables are actually set
    setTimeout(() => {
      const computedStyle = getComputedStyle(document.documentElement);
      console.log('=== CSS VARIABLES DEBUG ===');
      console.log('Primary 400:', computedStyle.getPropertyValue('--color-primary-400').trim());
      console.log('Primary 500:', computedStyle.getPropertyValue('--color-primary-500').trim());
      console.log('Primary 600:', computedStyle.getPropertyValue('--color-primary-600').trim());
      
      // Force a style recalculation
      document.documentElement.classList.add('theme-applied');
      document.documentElement.classList.remove('theme-applied');
    }, 100);
  }
}