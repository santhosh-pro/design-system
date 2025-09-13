// lib/pipes/humanize-form-messages.pipe.ts
import { Inject, Pipe, PipeTransform, Optional } from "@angular/core";
import { ValidationErrors } from "@angular/forms";
import { FORM_ERRORS, FormErrorMessages } from "../../core/form-errors";

@Pipe({
  standalone: true,
  name: 'humanizeFormMessages'
})
export class HumanizeFormMessagesPipe implements PipeTransform {
  constructor(
    @Optional() @Inject(FORM_ERRORS) private messages: FormErrorMessages | null
  ) {}

  transform(
    validationErrors: ValidationErrors | null,
    overriddenMessages: { [key: string]: string | Function } = {},
    fieldName: string = 'This field'
  ): string {
    if (!validationErrors) {
      return '';
    }

    // Get the first error key
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length === 0) {
      return '';
    }

    const messageKey = errorKeys[0];
    const errorValue = validationErrors[messageKey];

    // Try overridden messages first
    let getMessage = overriddenMessages[messageKey];
    
    // Fall back to injected messages
    if (!getMessage && this.messages) {
      getMessage = this.messages[messageKey];
    }

    if (!getMessage) {
      return `${fieldName} is invalid`;
    }

    try {
      if (typeof getMessage === 'function') {
        return getMessage({ 
          fieldName, 
          ...errorValue,
          actualLength: errorValue?.actualLength,
          requiredLength: errorValue?.requiredLength,
          min: errorValue?.min,
          max: errorValue?.max,
          actual: errorValue?.actual
        });
      }
      
      if (typeof getMessage === 'string') {
        return getMessage;
      }
    } catch (error) {
      console.warn(`Error generating message for ${messageKey}:`, error);
    }

    return `${fieldName} is invalid`;
  }
}