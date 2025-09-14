import { Directive, ElementRef, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

/**
 * Autofocus directive.
 */
@Directive({
  selector: '[uiAutofocus]',
  standalone: true
})
export class Autofocus implements OnInit, OnChanges {
  /**
   * Autofocus state as a signal.
   */
  public readonly autofocus = input<boolean>(false);

  public nativeElement?: HTMLElement;

  /**
   * Constructor.
   * @param el Element reference
   */
  constructor(public readonly el: ElementRef) {}

  /**
   * Lifecycle hook called after directive is initialized.
   */
  public ngOnInit(): void {
    this.nativeElement = this.el.nativeElement;
    if (this.nativeElement && this.autofocus()) {
      this.nativeElement.focus();
    }
  }

  /**
   * Lifecycle hook called on input change.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.nativeElement && this.autofocus()) {
      this.nativeElement.focus();
    }
  }
}