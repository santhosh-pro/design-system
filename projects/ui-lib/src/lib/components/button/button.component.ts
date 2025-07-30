import {Component, ElementRef, EventEmitter, inject, input, Input, OnInit, Output, Renderer2} from '@angular/core';
import {DOCUMENT, NgClass} from "@angular/common";
import {SpinnerComponent} from "../spinner/spinner.component";
import {FormGroup, FormGroupDirective} from "@angular/forms";
import {AppSvgIconComponent} from "../app-svg-icon/app-svg-icon.component";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    NgClass,
    SpinnerComponent,
    AppSvgIconComponent
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  elementRef = inject(ElementRef);
  document = inject(DOCUMENT);
  renderer = inject(Renderer2);

  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  appearance = input<'textType' | 'primary' | 'outline' | 'primaryRounded' | 'outlineRounded'>('primary');
  loading = input<boolean>(false);
  iconSize = input<number>(18);
  iconSrc = input<string | null>();
  iconColor = input<string | null>(null);
  buttonColor = input<string>('bg-primary-500');
  outlineColor = input<string>('border-primary-500');
  textButtonColor = input<string>('text-primary-500');
  size = input<'small' | 'medium' | 'large'>('medium');

  @Output() buttonClick = new EventEmitter<void>();

  formGroupDirective = inject(FormGroupDirective, {optional: true});

  getButtonClass(): string {
    let base = 'inline-flex items-center justify-center text-button leading-5 transition-all duration-200';

    const sizeClasses = {
      small: 'px-4 py-2 text-sm',
      medium: 'px-6 py-3 text-base',
      large: 'px-6 py-4 text-lg'
    };

    const appearanceClasses = {
      primary: `text-white rounded-md ${this.buttonColor()}`,
      primaryRounded: `text-white rounded-full ${this.buttonColor()}`,
      outline: `${this.textButtonColor()} rounded-md bg-white border ${this.outlineColor()} outline-none`,
      outlineRounded: `${this.textButtonColor()} rounded-full bg-white border ${this.outlineColor()} outline-none`,
      textType: `${this.textButtonColor()} rounded-md border border-transparent rounded-md bg-white outline-none focus:outline-none`
    };

    return `${base} ${sizeClasses[this.size()]} ${appearanceClasses[this.appearance()]} ${this.disabled() ? 'cursor-not-allowed' : ''} ${this.fullWidth() ? 'w-full' : ''}`;
  }

  getIconClass() {
    if (this.iconColor() != null) {
      return this.iconColor();
    }

    switch (this.appearance()) {
      case 'outline':
        return 'text-primary-500';
      case 'outlineRounded':
        return 'text-primary-500';
      case 'textType':
        return 'text-primary-500';
      case 'primaryRounded':
        return 'text-white';
      case 'primary':
      default:
        return 'text-white';
    }
  }

  getLoaderColor() {
    let borderClass = 'border-white';
    switch (this.appearance()) {
      case 'outline':
        borderClass = 'border-primary-500';
        break;
      case 'outlineRounded':
        borderClass = 'border-primary-500';
        break;
      case 'textType':
        borderClass = 'border-primary-500';
        break;
      case 'primaryRounded':
        borderClass = 'border-white';
        break;
      case 'primary':
      default:
        borderClass = 'border-white';
        break;
    }

    return borderClass
  }

  onClick(): void {
    if (this.loading()) {
      return;
    }
    if (this.type() == 'submit' && this.formGroupDirective) {
      const formGroup = this.formGroupDirective.form;
      this.validateForm(formGroup);
    }
    this.buttonClick.emit();
  }

  validateForm(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
    formGroup.markAsPristine();
  }
}
