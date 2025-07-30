import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function onlyFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    let selectedDate = new Date(control.value);
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : {invalidDate: 'Date must be in the future.'};
  };
}
