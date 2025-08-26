import {Component, input} from '@angular/core';
import {NoDataComponent} from "../../../feedback/no-data/no-data";

@Component({
  selector: 'app-no-data-table',
  standalone: true,
  imports: [
    NoDataComponent
  ],
  templateUrl: './no-data-table.html',
  styleUrl: './no-data-table.scss'
})
export class NoDataTableComponent {
  message = input<string>();
}
