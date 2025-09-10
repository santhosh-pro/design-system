import { Component, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ColumnNode, DataTableComponent, TableStateEvent } from '../../../../components/display/data-table/data-table';

export interface SelectDialogData<T> {
  title?: string;
  columns: ColumnNode[];
  data: T[];
  totalCount: number;
  valueProperty: string;
  displayProperty: string;
  enablePagination: boolean;
  pageSize: number;
  enableSearch: boolean;
  initialValue: any[];
  stateChange?: EventEmitter<TableStateEvent>;
}

@Component({
  selector: 'ui-select-dialog',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './select-dialog.html',
})
export class SelectDialogComponent<T> {
  dialogData = inject<SelectDialogData<T>>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<any[], SelectDialogComponent<T>>);

  selectedItems: any[] = []; // Store keys (e.g., IDs) instead of objects

  ngOnInit(): void {
    // Initialize selectedItems with the initialValue (array of keys)
    if (this.dialogData.initialValue) {
      this.selectedItems = [...this.dialogData.initialValue];
    }
  }

  onTableStateChanged(state: TableStateEvent): void {
    // Emit table state changes to parent (will handle later)
    this.dialogData.stateChange?.emit(state);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Return the selected keys
    this.dialogRef.close(this.selectedItems);
  }

  onSelectionChange(selectedKeys: any[]): void {
    console.log('Selected keys:', selectedKeys);
    this.selectedItems = selectedKeys;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}