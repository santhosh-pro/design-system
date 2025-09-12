import {Component, input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './spinner.html',
})
export class Spinner {
  borderColor = input('border-primary-500');
}
