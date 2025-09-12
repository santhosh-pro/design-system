import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnInit} from '@angular/core';
import {Toast} from "../toast/toast";
import {ToastEvent} from "../../models/toast-event";
import {ToastStore} from "../../toast-store";

@Component({
  selector: 'ui-toaster',
  standalone: true,
  imports: [
    Toast
  ],
  templateUrl: './toaster.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toaster implements OnInit {
  themeType = input<'light' | 'dark'>('light');

  currentToasts: ToastEvent[] = [];

  constructor(
    private toastService: ToastStore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscribeToToasts();
  }

  subscribeToToasts() {
    this.toastService.toastEvents.subscribe((toast) => {
      toast.themeType = this.themeType();
      this.currentToasts.push(toast);
      this.cdr.detectChanges();
    });
  }

  dispose(index: number) {
    this.currentToasts.splice(index, 1);
    this.cdr.detectChanges();
  }
}
