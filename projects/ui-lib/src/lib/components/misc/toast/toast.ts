import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {ToastEvent} from "./models/toast-event";
import {ToastType} from "./models/toast-type";

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  static defaultDuration = 3500;
  toastEvents: Observable<ToastEvent>;
  private _toastEvents = new Subject<ToastEvent>();

  constructor() {
    this.toastEvents = this._toastEvents.asObservable();
  }

  /**
   * Show success toast notification.
   * @param title Toast title
   * @param message Toast message
   * @param duration
   */
  success(message: string, {title, duration}: { title?: string, duration?: number } = {}) {
    this._toastEvents.next({
      message,
      title,
      type: ToastType.success,
      duration: duration,
    });
  }

  /**
   * Show error toast notification.
   * @param title Toast title
   * @param message Toast message
   * @param duration
   */
  error(message: string, {title, duration}: { title?: string, duration?: number } = {}) {
    this._toastEvents.next({
      message,
      title,
      type: ToastType.error,
      duration: duration
    });
  }

  /**
   * Show info toast notification.
   * @param title Toast title
   * @param message Toast message
   * @param duration
   */
  info(message: string, {title, duration}: { title?: string, duration?: number } = {}) {
    this._toastEvents.next({
      message,
      title,
      type: ToastType.info,
      duration: duration
    });
  }

  /**
   * Show warning toast notification.
   * @param title Toast title
   * @param message Toast message
   * @param duration
   */
  warning(message: string, {title, duration}: { title?: string, duration?: number } = {}) {
    this._toastEvents.next({
      message,
      title,
      type: ToastType.warning,
      duration: duration
    });
  }
}
