import {Inject, Pipe, PipeTransform} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {FORM_ERRORS} from '../../core/form-errors';

@Pipe({standalone: true, name: 'humanizeFormMessages'})
export class HumanizeFormMessagesPipe implements PipeTransform {
  constructor(@Inject(FORM_ERRORS) private messages: any) {
  }

  transform(
    validationErrors: ValidationErrors,
    overriddenMessages: { [key: string]: string }
  ) {
    if (!validationErrors) {
      return '';
    }

    // Allow the possibility to override messages
    const messages = {
      ...this.messages,
      ...overriddenMessages
    };

    const messageKey = Object.keys(validationErrors)[0];
    const getMessage = messages[messageKey];
    const message = getMessage
      ? getMessage(validationErrors[messageKey])
      : 'Invalid field';
    return message;
  }
}
