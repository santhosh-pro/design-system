import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'ui-toast-close-button',
  standalone: true,
  imports: [],
  templateUrl: './toast-close-button.html',
  styleUrl: './toast-close-button.scss'
})
export class ToastCloseButtonComponent {

  @Output() closeEvent = new EventEmitter();
  onCloseClick() {
    this.closeEvent.emit();
  }
}
