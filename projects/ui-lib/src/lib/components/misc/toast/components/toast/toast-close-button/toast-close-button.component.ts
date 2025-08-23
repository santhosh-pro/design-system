import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-toast-close-button',
  standalone: true,
  imports: [],
  templateUrl: './toast-close-button.component.html',
  styleUrl: './toast-close-button.component.scss'
})
export class ToastCloseButtonComponent {

  @Output() closeEvent = new EventEmitter();
  onCloseClick() {
    this.closeEvent.emit();
  }
}
