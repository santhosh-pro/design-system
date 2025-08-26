import {Component, input} from '@angular/core';

@Component({
  selector: 'ui-no-data',
  standalone: true,
  imports: [
  ],
  templateUrl: './no-data.html',
  styleUrl: './no-data.scss'
})
export class NoDataComponent {
  size = input(250);
  message = input.required<string>();
}
