import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-base-input',
  standalone: true,
  imports: [NgClass],
  templateUrl: './base-input.html',
})
export class BaseInputComponent {
  title = input<string | null | undefined>(null);
  isRequiredField = input<boolean>(false);
  fullWidth = input<boolean>(false);
  inputType = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'file'>('text');
}