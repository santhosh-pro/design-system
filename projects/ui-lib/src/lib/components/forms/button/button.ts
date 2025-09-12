import { Component, computed, inject, input, output, Signal } from '@angular/core';
import { FormGroup, FormGroupDirective } from "@angular/forms";
import { NgClass } from "@angular/common";
import { Spinner } from '../../feedback/spinner/spinner';
import { AppSvgIcon } from '../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [
    NgClass,
    Spinner,
    AppSvgIcon
  ],
  templateUrl: './button.html',
})
export class Button {
  formGroupDirective = inject(FormGroupDirective, { optional: true });

  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  // Renamed 'textType' to 'text' for clarity and standard naming
  appearance = input<'text' | 'primary' | 'outline' | 'primaryRounded' | 'outlineRounded'>('primary');
  loading = input<boolean>(false);
  iconSize = input<number>(18);
  iconSrc = input<string | null>(null);
  iconColor = input<string | null>(null);
  buttonColor = input<string>('bg-primary-500');
  outlineColor = input<string>('border-primary-500');
  textButtonColor = input<string>('text-primary-500');
  size = input<'small' | 'medium' | 'large'>('medium');

  click = output<void>();

  protected buttonClass: Signal<string> = computed(() => {
    const base = 'inline-flex items-center justify-center text-button leading-5 transition-all duration-200';

    const sizeClass = {
      small: 'px-4 py-2 text-sm',
      medium: 'px-6 py-3 text-base',
      large: 'px-6 py-4 text-lg'
    }[this.size()];

    let appearanceClass: string;
    switch (this.appearance()) {
      case 'primary':
        appearanceClass = `text-white rounded-md ${this.buttonColor()}`;
        break;
      case 'primaryRounded':
        appearanceClass = `text-white rounded-full ${this.buttonColor()}`;
        break;
      case 'outline':
        appearanceClass = `${this.textButtonColor()} rounded-md bg-white border ${this.outlineColor()} outline-none`;
        break;
      case 'outlineRounded':
        appearanceClass = `${this.textButtonColor()} rounded-full bg-white border ${this.outlineColor()} outline-none`;
        break;
      case 'text':
        // Removed duplicate 'rounded-md' and fixed for clarity
        appearanceClass = `${this.textButtonColor()} rounded-md border border-transparent bg-white outline-none focus:outline-none`;
        break;
      default:
        appearanceClass = '';
    }

    const disabledClass = this.disabled() || this.loading() ? 'cursor-not-allowed' : '';
    const fullWidthClass = this.fullWidth() ? 'w-full' : '';

    return [base, sizeClass, appearanceClass, disabledClass, fullWidthClass].filter(Boolean).join(' ');
  });

  protected iconClass: Signal<string> = computed(() => {
    if (this.iconColor() !== null) {
      return this.iconColor()!;
    }

    switch (this.appearance()) {
      case 'outline':
      case 'outlineRounded':
      case 'text':
        return 'text-primary-500';
      case 'primaryRounded':
      case 'primary':
      default:
        return 'text-white';
    }
  });

  protected loaderColor: Signal<string> = computed(() => {
    switch (this.appearance()) {
      case 'outline':
      case 'outlineRounded':
      case 'text':
        return 'border-primary-500';
      case 'primaryRounded':
      case 'primary':
      default:
        return 'border-white';
    }
  });

  onClick(event: MouseEvent): void {
    // Since [disabled] is set, this early return is precautionary
    if (this.loading() || this.disabled()) {
      event.preventDefault();
      return;
    }

    if (this.type() === 'submit' && this.formGroupDirective) {
      const formGroup = this.formGroupDirective.form;
      this.validateForm(formGroup);
    }

    this.click.emit();
  }

  private validateForm(formGroup: FormGroup): void {
    formGroup.markAllAsTouched();
    // Removed markAsPristine() as it contradicts the purpose of showing validation errors
  }
}