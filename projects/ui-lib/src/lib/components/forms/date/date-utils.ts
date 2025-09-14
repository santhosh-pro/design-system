import { InputDateFormat } from './date-format';

export class DateUtils {
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static parseDate(dateStr: string | null, format: InputDateFormat): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [part1, part2, part3] = parts.map(Number);
    const [mm, dd, yyyy] = format === InputDateFormat.mmddyyyy ? [part1, part2, part3] : [part2, part1, part3];

    if (!mm || !dd || !yyyy || mm > 12 || dd > 31 || yyyy < 1000 || yyyy > 9999) return null;

    const parsedDate = new Date(yyyy, mm - 1, dd);
    if (parsedDate.getMonth() + 1 !== mm || parsedDate.getDate() !== dd || parsedDate.getFullYear() !== yyyy) {
      return null;
    }

    return parsedDate;
  }

  static formatDate(date: Date, format: InputDateFormat): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return format === InputDateFormat.mmddyyyy ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
  }

    static formatMonthYear(date: Date, format: InputDateFormat): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return format === InputDateFormat.mmddyyyy
      ? `${month}/${year}`
      : `${month}/${year}`;
  }
}