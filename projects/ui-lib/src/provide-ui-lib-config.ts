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
      // console.log('Skipping theme application on server (SSR)');
      return;
    }

    const theme = this.config.tailwindTheme;
    if (!theme) {
      console.warn('No tailwindTheme provided in UiLibConfig');
      return;
    }

    console.log('Theme is applied statically via styles.css; applyTailwindTheme is optional.');

    if (theme.fonts?.inter) {
      document.documentElement.style.setProperty('--font-inter', theme.fonts.inter);
      console.log('Set --font-inter:', theme.fonts.inter);
    }

    const colorCategories: ColorCategory[] = ['primary', 'success', 'info', 'warning', 'error'];
    colorCategories.forEach((category) => {
      const colors = theme.colors?.[category];
      if (colors) {
        Object.entries(colors).forEach(([shade, value]) => {
          document.documentElement.style.setProperty(`--color-${category}-${shade}`, value);
          console.log(`Set --color-${category}-${shade}: ${value}`);
        });
      }
    });

    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--shadow-${key}`, value);
        console.log(`Set --shadow-${key}: ${value}`);
      });
    }

    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, props]) => {
        if (props.size) document.documentElement.style.setProperty(`--text-${key}-size`, props.size);
        if (props.lineHeight) document.documentElement.style.setProperty(`--text-${key}-line-height`, props.lineHeight);
        if (props.letterSpacing) document.documentElement.style.setProperty(`--text-${key}-letter-spacing`, props.letterSpacing);
        if (props.fontWeight) document.documentElement.style.setProperty(`--text-${key}-font-weight`, props.fontWeight.toString());
        console.log(`Set typography for ${key}:`, props);
      });
    }
  }

  getColor(category: string, shade: string): string | undefined {
    const value = this.config.tailwindTheme?.colors?.[category as keyof typeof this.config.tailwindTheme.colors]?.[shade];
    if (value) return value;
    if (isPlatformBrowser(this.platformId)) {
      return getComputedStyle(document.documentElement).getPropertyValue(`--color-${category}-${shade}`).trim() || undefined;
    }
    return undefined;
  }

  getFontInter(): string | undefined {
    const value = this.config.tailwindTheme?.fonts?.inter;
    if (value) return value;
    if (isPlatformBrowser(this.platformId)) {
      return getComputedStyle(document.documentElement).getPropertyValue('--font-inter').trim() || undefined;
    }
    return undefined;
  }

  getShadow(key: string): string | undefined {
    const value = this.config.tailwindTheme?.shadows?.[key];
    if (value) return value;
    if (isPlatformBrowser(this.platformId)) {
      return getComputedStyle(document.documentElement).getPropertyValue(`--shadow-${key}`).trim() || undefined;
    }
    return undefined;
  }

  getTypography(key: string): { size?: string; lineHeight?: string; letterSpacing?: string; fontWeight?: string | number } | undefined {
    const value = this.config.tailwindTheme?.typography?.[key];
    if (value) return value;
    if (isPlatformBrowser(this.platformId)) {
      const size = getComputedStyle(document.documentElement).getPropertyValue(`--text-${key}-size`).trim() || undefined;
      const lineHeight = getComputedStyle(document.documentElement).getPropertyValue(`--text-${key}-line-height`).trim() || undefined;
      const letterSpacing = getComputedStyle(document.documentElement).getPropertyValue(`--text-${key}-letter-spacing`).trim() || undefined;
      const fontWeight = getComputedStyle(document.documentElement).getPropertyValue(`--text-${key}-font-weight`).trim() || undefined;
      return {
        size,
        lineHeight,
        letterSpacing,
        fontWeight: fontWeight ? (isNaN(Number(fontWeight)) ? fontWeight : Number(fontWeight)) : undefined,
      };
    }
    return undefined;
  }
}