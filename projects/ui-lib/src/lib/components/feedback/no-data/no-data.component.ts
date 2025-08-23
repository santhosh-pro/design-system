import {Component, input} from '@angular/core';

@Component({
  selector: 'app-no-data',
  standalone: true,
  imports: [
  ],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.scss'
})
export class NoDataComponent {
  size = input(250);
  message = input.required<string>();
}
