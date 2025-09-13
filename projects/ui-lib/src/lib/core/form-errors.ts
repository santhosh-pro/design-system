// lib/core/form-errors.ts
import { InjectionToken } from '@angular/core';
import { Provider } from '@angular/core';

// Define the interface for form error functions
export interface FormErrorMessages {
  [key: string]: (params: any) => string;
}

// Create the injection token
export const FORM_ERRORS = new InjectionToken<FormErrorMessages>('FORM_ERRORS');

// Default error messages
export const DEFAULT_FORM_ERRORS: FormErrorMessages = {
  required: ({ fieldName }) => `${fieldName} is required`,
  email: ({ fieldName }) => `${fieldName} must be a valid email address`,
  minlength: ({ fieldName, requiredLength, actualLength }) => 
    `${fieldName} must be at least ${requiredLength} characters (current: ${actualLength})`,
  maxlength: ({ fieldName, requiredLength, actualLength }) => 
    `${fieldName} cannot exceed ${requiredLength} characters (current: ${actualLength})`,
  min: ({ fieldName, min, actual }) => 
    `${fieldName} must be at least ${min} (current: ${actual})`,
  max: ({ fieldName, max, actual }) => 
    `${fieldName} cannot be more than ${max} (current: ${actual})`,
  pattern: ({ fieldName }) => `${fieldName} format is invalid`,
  emailPattern: ({ fieldName }) => `${fieldName} must be a valid email format`,
  phonePattern: ({ fieldName }) => `${fieldName} must be a valid phone number`,
  passwordPattern: ({ fieldName }) => 
    `${fieldName} must contain at least one uppercase, one lowercase, one number and one special character`,
};

export function provideFormErrors(messages?: Partial<FormErrorMessages>): Provider {
  return {
    provide: FORM_ERRORS,
    useValue: { ...DEFAULT_FORM_ERRORS, ...messages }
  };
}