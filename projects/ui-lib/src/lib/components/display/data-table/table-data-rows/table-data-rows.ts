import { Component, effect, EventEmitter, input, output, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColumnDef, TableActionEvent } from '../data-table';
import { DynamicRenderer } from '../dynamic-renderer';
import { StatusBadge } from '../../../../components/feedback/status-badge/status-badge';
import { ContextMenuButton } from '../../../../components/overlay/context-menu-button/context-menu-button';
import { AppSvgIcon } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { TableCellRenderer } from '../table-cell-renderer/table-cell-renderer';

interface RowSelectionEvent {
  selected: boolean;
  item: any;
}

@Component({
  selector: 'ui-table-data-rows',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicRenderer,
    StatusBadge,
    ContextMenuButton,
    AppSvgIcon,
    TableCellRenderer
],
  templateUrl: './table-data-rows.html',
})
export class TableDataRows {
  // Inputs
  data = input<any[]>([]);
  columns = input<ColumnDef[]>([]);
  enableRowSelection = input<boolean>(false);
  enableExpandable = input<boolean>(false);
  expandableComponent = input<any | null>(null);
  expandedRowIndex = input<number | null>(null);
  selectedItems = input<any[]>([]);
  rowSelectionKey = input<string>('id');
  enableClickableRows = input<boolean>(false);

  // Outputs
  rowClicked = output<any>();
  rowExpanded = output<number>();
  rowSelectionChange = output<RowSelectionEvent>();
  actionPerformed = output<TableActionEvent>();

  // Internal
  private itemControls = new Map<any, FormControl<boolean>>();

  constructor() {
    // Update form controls when data or selection changes
    effect(() => {
      this.updateFormControls();
    });
  }

  private updateFormControls() {
    // Clear old controls
    this.itemControls.clear();
    
    // Create controls for current data
    this.data().forEach(item => {
      this.getItemControl(item);
    });
  }

  getTotalColumns(): number {
    return this.columns().length + (this.enableRowSelection() ? 1 : 0) + (this.enableExpandable() ? 1 : 0);
  }

  isRowSelected(item: any): boolean {
    const itemId = this.getItemId(item);
    return this.selectedItems().some(selectedId => selectedId === itemId);
  }

  getItemId(item: any): any {
    const key = this.rowSelectionKey();
    if (!key || !item) return item;
    return key.split('.').reduce((acc, part) => acc?.[part], item);
  }

  getItemControl(item: any): FormControl<boolean> {
    let control = this.itemControls.get(item);
    if (!control) {
      control = new FormControl<boolean>(this.isRowSelected(item), { nonNullable: true });
      
      control.valueChanges.subscribe((checked) => {
        this.rowSelectionChange.emit({ selected: checked, item });
      });
      
      this.itemControls.set(item, control);
    } else {
      // Update existing control value if selection state changed
      const currentSelection = this.isRowSelected(item);
      if (control.value !== currentSelection) {
        control.setValue(currentSelection, { emitEvent: false });
      }
    }
    return control;
  }

  onRowClicked(item: any) {
    if (this.enableClickableRows()) {
      this.rowClicked.emit(item);
    }
  }

  onRowExpanded(index: number) {
    this.rowExpanded.emit(index);
  }

  onActionPerformed(event: TableActionEvent) {
    this.actionPerformed.emit(event);
  }

  getCellClass(column: ColumnDef): string {
    let classes = this.getAlignmentClass(column);
    
    if (column.type === 'actions') {
      classes += ' sticky right-0 z-[40] bg-white shadow-[-2px_0_4px_rgba(0,0,0,0.1)] border-l-2 border-gray-300 w-32 min-w-[128px] max-w-[128px]';
    } else {
      classes += ' ' + this.getColumnWidthClass(column);
    }
    
    return classes;
  }

  private getAlignmentClass(column: ColumnDef): string {
    switch (column.alignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  }

  private getColumnWidthClass(column: ColumnDef): string {
    switch (column.type) {
      case 'checkbox': return 'w-12 min-w-[48px] max-w-[48px]';
      case 'actions': return 'w-32 min-w-[128px] max-w-[128px]';
      default: return 'w-40 min-w-[120px] max-w-[200px]';
    }
  }
}