import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export function mmddyyyyDateValidatorAsync(): AsyncValidatorFn {
  return (control: AbstractControl): any => {
    const value: string = control.value;

    if (!value) {
      return of(null);
    }

    const regexWithSlashes = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    const regexWithoutSlashes = /^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{4}$/;

    return of(value).pipe(
      delay(500),
      map(() => {
        if (regexWithSlashes.test(value)) {
          const [month, day, year] = value.split('/').map(Number);
          const date = new Date(year, month - 1, day);

          if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return { invalidDate: 'Invalid date. Make sure the day, month, and year are correct.' };
          }
        }
        else if (regexWithoutSlashes.test(value)) {
          const month = Number(value.substring(0, 2));
          const day = Number(value.substring(2, 4));
          const year = Number(value.substring(4, 8));

          const date = new Date(year, month - 1, day);

          if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return { invalidDate: 'Invalid date. Make sure the day, month, and year are correct.' };
          }
        }
        else {
          return { invalidDate: 'Invalid date format. Use mm/dd/yyyy or mmddyyyy.' };
        }

        return null;
      })
    );
  };
}
