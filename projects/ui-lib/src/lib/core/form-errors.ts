import {InjectionToken} from '@angular/core';

export const defaultErrors = {
  required: ({ fieldName }: any) => `${fieldName} is required`,
  minlength: ({ fieldName, requiredLength }: any) =>
    `${fieldName} must be at least ${requiredLength} characters long`,
  maxlength: ({ fieldName, requiredLength }: any) =>
    `${fieldName} cannot exceed ${requiredLength} characters`,
  min: ({ fieldName, min }: any) => `${fieldName} must be at least ${min}`,
  max: ({ fieldName, max }: any) => `${fieldName} must be at most ${max}`,
  matchOthers: ({ fieldName }: any) => `${fieldName} does not match`,
  email: ({ fieldName }: any) => `Please enter a valid email for ${fieldName}`,
  invalidDate: ({ fieldName, errorMessage }: any) =>
    `${fieldName}: ${errorMessage}`,
};

export const FORM_ERRORS = new InjectionToken('FORM_ERRORS', {
  providedIn: 'root',
  factory: () => defaultErrors
});
