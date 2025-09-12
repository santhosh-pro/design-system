import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInput } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';

@Component({
  selector: 'ui-otp-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInput,
    HumanizeFormMessagesPipe,
  ],
  templateUrl: './otp-field.html',
})
export class OtpField extends BaseControlValueAccessor<string | null> {
  // Inputs
  readonly length = input<number>(6);
  readonly label = input<string | null>(null);
  readonly width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  readonly showErrorSpace = input<boolean>(false);

  // Output
  readonly complete = output<string>();

  // Signals
  readonly digits = signal<string[]>([]);
  readonly isFocused = signal(false);

  // Computed
  readonly digitIndices = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  readonly otpValue = computed(() => {
    const otp = this.digits().join('');
    return otp.length === this.length() && otp.replace(/\s/g, '').length === this.length() 
      ? otp 
      : null;
  });
  readonly isComplete = computed(() => this.otpValue() !== null);

  constructor() {
    super();
    
    // Initialize digits array
    this.digits.set(Array(this.length()).fill(''));
    
    // Update digits array when length changes
    effect(() => {
      const currentDigits = this.digits();
      const newLength = this.length();
      
      if (currentDigits.length !== newLength) {
        const newDigits = Array(newLength).fill('');
        const copyLength = Math.min(newLength, currentDigits.length);
        
        for (let i = 0; i < copyLength; i++) {
          newDigits[i] = currentDigits[i];
        }
        
        this.digits.set(newDigits);
      }
    });
    
    // Emit value when digits change
    effect(() => {
      const value = this.otpValue();
      this.formControl.setValue(value, { emitEvent: false });
      this.onValueChange(value);
      
      if (value) {
        this.complete.emit(value);
      }
    });
  }

  protected override onValueReady(value: string | null): void {
    if (value) {
      this.setDigitsFromValue(value);
    } else {
      this.digits.set(Array(this.length()).fill(''));
    }
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const sanitized = this.sanitizeInput(input.value);

    if (sanitized.length > 1) {
      this.handlePastedValue(sanitized, index);

      return;
    }

    this.updateDigit(index, sanitized);

    if (sanitized && index < this.length() - 1 && !this.isComplete()) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        this.handleBackspace(index, input.value);
        break;
        
      case 'Delete':
        event.preventDefault();
        this.updateDigit(index, '');
        break;
        
      case 'ArrowLeft':
        if (index > 0) this.focusInput(index - 1);
        break;
        
      case 'ArrowRight':
        if (index < this.length() - 1) this.focusInput(index + 1);
        break;
        
      default:
        if (this.isAlphanumeric(event.key)) {
          event.preventDefault();
          this.updateDigit(index, event.key.toUpperCase());
          
          if (index < this.length() - 1 && !this.isComplete()) {
            this.focusInput(index + 1);
          }
        }
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
    this.formControl.updateValueAndValidity();
  }

  onPaste(event: ClipboardEvent, index: number): void {
    if (this.formControl.disabled) return;
    
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    this.handlePastedValue(pastedData, index);
  }

  private handlePastedValue(value: string, startIndex: number): void {
    const sanitized = this.sanitizeInput(value);
    const newDigits = [...this.digits()];
    const maxLength = Math.min(sanitized.length, this.length() - startIndex);

    for (let i = 0; i < maxLength; i++) {
      newDigits[startIndex + i] = sanitized[i];
    }

    this.digits.set(newDigits);

    if (!this.isComplete()) {
      const nextEmptyIndex = this.findNextEmptyIndex(startIndex);
      const focusIndex = nextEmptyIndex !== -1 
        ? nextEmptyIndex 
        : Math.min(startIndex + maxLength, this.length() - 1);
      this.focusInput(focusIndex);
    }
  }

  private handleBackspace(index: number, currentValue: string): void {
    if (currentValue) {
      this.updateDigit(index, '');
    } else if (index > 0) {
      this.updateDigit(index - 1, '');
      this.focusInput(index - 1);
    }
  }

  private updateDigit(index: number, value: string): void {
    const newDigits = [...this.digits()];
    newDigits[index] = value;
    this.digits.set(newDigits);
  }

  private setDigitsFromValue(value: string): void {
    const sanitized = this.sanitizeInput(value);
    const newDigits = Array(this.length()).fill('');
    
    for (let i = 0; i < Math.min(sanitized.length, this.length()); i++) {
      newDigits[i] = sanitized[i];
    }
    
    this.digits.set(newDigits);
  }

  private focusInput(index: number): void {
    if (this.isComplete()) return;
    
    setTimeout(() => {
      const inputs = document.querySelectorAll('.otp-input');
      const targetInput = inputs[index] as HTMLInputElement;
      
      if (targetInput && document.activeElement !== targetInput) {
        targetInput.focus();
        if (index < this.length() - 1) {
          targetInput.select();
        }
      }
    });
  }

  private findNextEmptyIndex(startIndex: number): number {
    return this.digits().findIndex((digit, idx) => idx >= startIndex && !digit);
  }

  private sanitizeInput(input: string): string {
    return input.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  }

  private isAlphanumeric(key: string): boolean {
    return /^[0-9a-zA-Z]$/.test(key);
  }
}