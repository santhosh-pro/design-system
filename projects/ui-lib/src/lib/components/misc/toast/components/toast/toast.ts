import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  input,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ToastType} from "../../models/toast-type";
import {ToastCloseButton} from "./toast-close-button/toast-close-button";
import {ToastStore} from "../../toast-store";
import {NgClass} from "@angular/common";

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [
    ToastCloseButton,
    NgClass
  ],
  templateUrl: './toast.html',
})
export class Toast implements OnInit, OnDestroy {

  @Output() disposeEvent = new EventEmitter();

  @Input()
  type!: ToastType;

  @Input()
  title?: string;

  @Input()
  message!: string;

  @Input()
  duration?: number;

  themeType = input<'light' | 'dark'>('light');

  themeClass = computed(() => {
    let classes = '';
    switch (this.themeType()) {
      case 'light':
        classes = 'bg-white';
        break;
      case 'dark':
        classes = 'bg-black';
        break;
    }
    return classes;
  });

  protected readonly ToastType = ToastType;

  ngOnInit() {
    this.show();
  }

  show() {
    setTimeout(() => {
      this.hide();
    }, this.duration ?? ToastStore.defaultDuration);
  }

  hide() {
    this.disposeEvent.emit();
  }

  ngOnDestroy(): void {
  }
}
