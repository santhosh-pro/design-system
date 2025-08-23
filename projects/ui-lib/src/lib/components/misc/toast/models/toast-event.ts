import { ToastType } from './toast-type';

export interface ToastEvent {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  themeType?: 'light' | 'dark';
}
