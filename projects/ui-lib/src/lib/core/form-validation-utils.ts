import {AbstractControl, ValidatorFn} from '@angular/forms';

export class FormValidationUtils {
  updateValidatorsIfNeeded(control: AbstractControl | null, addValidators: ValidatorFn[]) {
    if (!control) return;

    const existingValidator = control.validator;
    const currentValidators: ValidatorFn[] = [];

    if (existingValidator) {
      currentValidators.push(existingValidator);
    }

    const toAdd = addValidators.filter(
      newVal => !currentValidators.includes(newVal)
    );

    if (toAdd.length) {
      control.setValidators([...currentValidators, ...toAdd]);
      control.updateValueAndValidity();
    }
  }

}

