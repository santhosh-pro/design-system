import { Component, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DataTable } from '../../../../display/data-table/data-table';
import { ColumnNode, TableStateEvent } from '../../../../../components/display/data-table/desktop-data-table/desktop-data-table';

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
  selector: 'ui-multi-select-data-table-dialog',
  standalone: true,
  imports: [CommonModule, DataTable],
  templateUrl: './multi-select-data-table-dialog.html',
})
export class MultiSelectDataTableDialog<T> {
  dialogData = inject<SelectDialogData<T>>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<any[], MultiSelectDataTableDialog<T>>);

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