import { Component, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-base-input',
  standalone: true,
  imports: [NgClass],
  templateUrl: './base-input.html',
})
export class BaseInputComponent {
  title = input<string | null | undefined>(null);
  isRequiredField = input<boolean>(false);
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  inputType = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'file'>('text');

  // Compute the width class
  widthClass = computed(() => {
    const width = this.width();
    const sizeMap: { [key: string]: string } = {
      sm: 'w-32',
      md: 'w-64',
      lg: 'w-96',
      xl: 'w-[30rem]',
      xxl: 'w-[36rem]',
      '3xl': 'w-[48rem]',
      full: 'w-full',
    };
    return sizeMap[width] || (width.startsWith('w-') ? width : 'w-64');
  });
}