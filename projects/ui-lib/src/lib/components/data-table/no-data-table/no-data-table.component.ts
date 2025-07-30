import {Component, input} from '@angular/core';
import {NoDataComponent} from "../../no-data/no-data.component";

@Component({
  selector: 'app-no-data-table',
  standalone: true,
  imports: [
    NoDataComponent
  ],
  templateUrl: './no-data-table.component.html',
  styleUrl: './no-data-table.component.scss'
})
export class NoDataTableComponent {
  message = input<string>();
}
