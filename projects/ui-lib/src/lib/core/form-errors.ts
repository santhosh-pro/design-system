import {InjectionToken} from '@angular/core';

export const defaultErrors = {
  required: () => `Required`,
  minlength: ({requiredLength, actualLength}: any) =>
    `Minimum ${requiredLength} characters required`,
  maxlength: ({requiredLength, actualLength}: any) =>
    `Maximum ${requiredLength} characters allowed`,
  min: ({min, actual}: any) => `Minimum ${min} required`,
  max: ({max, actual}: any) => `Maximum ${max} allowed`,
  matchOthers: () => 'Passwords does not match',
  email: () => 'Please enter a valid email',
  invalidDate: (errorMessage: any) => errorMessage,
};

export const FORM_ERRORS = new InjectionToken('FORM_ERRORS', {
  providedIn: 'root',
  factory: () => defaultErrors
});
