import {Component, input, Input, output} from '@angular/core';
import {TableActionEvent} from '../data-table';

@Component({
  selector: 'lib-table-custom-component',
  standalone: true,
  imports: [],
  templateUrl: './table-custom.html',
})
export class TableCustomComponent<T> {
  @Input() rowData!: T;
  @Input() data: any;
  @Input() rowPosition: number | undefined;
  @Input() isLastRow: boolean = false;

  actionPerformed = output<TableActionEvent>();
}
