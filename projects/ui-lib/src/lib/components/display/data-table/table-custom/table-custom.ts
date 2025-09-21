import {Component, input, Input, output} from '@angular/core'; 
import { TableActionEvent } from '../data-table-model';

@Component({
  standalone: true,
  imports: [],
  template: ``
})
export class TableCustom<T> {
  @Input() rowData!: T;
  @Input() data: any;
  @Input() rowPosition: number | undefined;
  @Input() isLastRow: boolean = false;
  actionPerformed = output<TableActionEvent>();
}