import { Component, computed, input, inject, signal, AfterContentInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../../components/misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { ColumnNode, TableStateEvent } from '../../../../components/display/data-table/data-table';
import { SelectDialogComponent } from '../select-dialog/select-dialog';

@Component({
  selector: 'ui-data-table-multi-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    HumanizeFormMessagesPipe,
  ],
  templateUrl: './data-table-multi-select.html',
})
export class DataTableMultiSelectComponent<T> extends BaseControlValueAccessor<any[]> implements AfterContentInit {
  label = input<string | null>(null);
  placeholder = input<string>('');
  columns = input<ColumnNode[]>([]);
  data = input<T[]>([]);
  valueProperty = input<string>('id');
  displayProperty = input<string>('name');
  fullWidth = input<boolean>(false);
  enablePagination = input<boolean>(false);
  pageSize = input<number>(10);
  enableSearch = input<boolean>(true);
  showErrorSpace = input<boolean>(false);
  totalCount = input<number>(0);


  tableStateChange = output<TableStateEvent>(); // To emit table state changes to parent

  selectedItems = signal<T[]>([]);
  isFocused = signal<boolean>(false);
  

  displayText = computed(() => {
    const items = this.selectedItems();
    if (!items.length) return '';
    return items.map((item) => this.getDisplayString(item)).join(', ');
  });

  private dialog = inject(Dialog);

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();
    if (this.formControl && this.formControl.value == null) {
      this.formControl.setValue([], { emitEvent: false });
    }
    if (this.formControl) {
      this.formControl.valueChanges.subscribe(() => this.updateSelectedItems());
    }
    this.updateSelectedItems();
  }

  protected override onValueReady(value: any[] | null): void {
    if (this.formControl) {
      this.formControl.setValue(value || [], { emitEvent: false });
    }
    this.updateSelectedItems();
  }

  private updateSelectedItems(): void {
    const values = this.formControl?.value || [];
    if (!Array.isArray(values)) {
      this.selectedItems.set([]);
      return;
    }
    const items = values
      .map((value) => this.getObjectUsingIdentifierValue(value))
      .filter((item): item is T => item !== undefined);
    this.selectedItems.set(items);
  }

  private getObjectUsingIdentifierValue(value: any): T | undefined {
    const identifierPath = this.valueProperty();
    return this.data().find((item) => {
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], item as any);
      return propertyValue === value;
    });
  }

  private getDisplayString(item: T): string {
    if (!item) return '';
    const object = item as any;
    return this.displayProperty().split('.').reduce((acc, part) => acc && acc[part], object) || '';
  }

openDialog(): void {
  const dialogRef = this.dialog.open<SelectDialogComponent<T>>(SelectDialogComponent, {
    width: '80vw',
    maxWidth: '800px',
    height: '80vh',
    panelClass: 'custom-dialog-class',
    autoFocus: false,
    hasBackdrop: true,
    data: {
      title: this.label() || 'Select Items',
      columns: this.columns(),
      data: this.data(),
      totalCount: this.totalCount(),
      valueProperty: this.valueProperty(),
      displayProperty: this.displayProperty(),
      enablePagination: this.enablePagination(),
      pageSize: this.pageSize(),
      enableSearch: this.enableSearch(),
      initialValue: this.formControl?.value || [], // Already an array of keys
      stateChange: this.tableStateChange, // Add stateChange to dialog data (for later)
    }
  });

  dialogRef.closed.subscribe((result: any[] | any) => {
    if (result !== undefined) {
      this.formControl?.setValue(result);
      this.valueChange.emit(result);
    }
  });
}

  clearAll(event: Event): void {
    event.stopPropagation();
    this.formControl?.setValue([]);
    // don't call the private onChange from the base class; rely on the form control and the valueChange output
    this.valueChange.emit([]);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
  }
}