import { Pipe, PipeTransform } from '@angular/core';
import { InputDateFormat } from '../date-format';
import { DateUtils } from '../date-utils';

@Pipe({
  name: 'formatMonthYear',
  standalone: true,
  pure: true
})
export class FormatMonthYearPipe implements PipeTransform {
  transform(value: Date | null, format: InputDateFormat = InputDateFormat.mmddyyyy): string {
    if (!value || !DateUtils.isValidDate(value)) return '';
    return DateUtils.formatMonthYear(value, format);
  }
}