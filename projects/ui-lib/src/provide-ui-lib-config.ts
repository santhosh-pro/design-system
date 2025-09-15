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
      neutral?: { [key: string]: string };
    };
    shadows?: { [key: string]: string };
    typography?: {
      [key: string]: { size?: string; lineHeight?: string; letterSpacing?: string; fontWeight?: number | string };
    };
  };
}

export const UI_LIB_CONFIG = new InjectionToken<UiLibConfig>('UI_LIB_CONFIG');

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
      return;
    }

    const theme = this.config.tailwindTheme;
    if (!theme) {
      return;
    }

    // Apply colors
    const colorCategories: ('primary' | 'success' | 'info' | 'warning' | 'error' | 'neutral')[] = [
      'primary',
      'success',
      'info',
      'warning',
      'error',
      'neutral',
    ];
    colorCategories.forEach((category) => {
      const colors = theme.colors?.[category];
      if (colors) {
        Object.entries(colors).forEach(([shade, value]) => {
          document.documentElement.style.setProperty(`--color-${category}-${shade}`, value);
        });
      }
    });

    // Apply fonts
    if (theme.fonts?.inter) {
      document.documentElement.style.setProperty('--font-inter', theme.fonts.inter);
    }

    // Apply shadows
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--shadow-${key}`, value);
      });
    }

    // Apply typography (if needed by other components)
    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, props]) => {
        if (props.size) {
          document.documentElement.style.setProperty(`--text-${key}-size`, props.size);
        }
        if (props.lineHeight) {
          document.documentElement.style.setProperty(`--text-${key}-line-height`, props.lineHeight);
        }
        if (props.letterSpacing) {
          document.documentElement.style.setProperty(`--text-${key}-letter-spacing`, props.letterSpacing);
        }
        if (props.fontWeight) {
          document.documentElement.style.setProperty(`--text-${key}-font-weight`, props.fontWeight.toString());
        }
      });
    }
  }
}