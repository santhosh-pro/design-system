import { Directive, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[appDebounce]',
  standalone: true,
})
export class DebounceDirective {
  @Input() debounceTime = 300; // default 300ms
  @Output() debounce = new EventEmitter<string>();

  private inputSubject = new Subject<string>();

  constructor() {
    this.inputSubject.pipe(
      debounceTime(this.debounceTime)
    ).subscribe(value => this.debounce.emit(value));
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target && target.value !== undefined) {
      this.inputSubject.next(target.value);
    }
  }
}
