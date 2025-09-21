import { Component, computed, input, inject, signal, AfterContentInit, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseInput } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { OverlayStore } from '../../../overlay/overlay';
import { MultiSelectDataTableDialog } from './multi-select-data-table-dialog/multi-select-data-table-dialog';
import { ColumnNode, TableStateEvent } from '../../../../components/display/data-table/data-table-model';

@Component({
  selector: 'ui-multi-select-data-table-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInput,
    HumanizeFormMessagesPipe,
  ],
  templateUrl: './multi-select-data-table-field.html',
})
export class MultiSelectDataTableField<T> extends BaseControlValueAccessor<any[]> implements AfterContentInit {
  label = input<string | null>(null);
  placeholder = input<string>('');
  columns = input<ColumnNode[]>([]);
  data = input<T[]>([]);
  valueProperty = input<string>('id');
  displayProperty = input<string>('name');
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  enablePagination = input<boolean>(false);
  pageSize = input<number>(10);
  enableSearch = input<boolean>(true);
  showErrorSpace = input<boolean>(true);
  totalCount = input<number>(0);
  overlayType = input<'modal' | 'fullscreen' | 'bottomsheet' | 'backdrop'>('modal'); // New input for overlay type

  tableStateChange = output<TableStateEvent>();

  selectedItems = signal<T[]>([]);
  isFocused = signal<boolean>(false);

  displayText = computed(() => {
    const items = this.selectedItems();
    if (!items.length) return '';
    return items.map((item) => this.getDisplayString(item)).join(', ');
  });

  private overlayService = inject(OverlayStore); // Inject OverlayService

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
    const dialogData = {
      title: this.label() || 'Select Items',
      columns: this.columns(),
      data: this.data(),
      totalCount: this.totalCount(),
      valueProperty: this.valueProperty(),
      displayProperty: this.displayProperty(),
      enablePagination: this.enablePagination(),
      pageSize: this.pageSize(),
      enableSearch: this.enableSearch(),
      initialValue: this.formControl?.value || [],
      stateChange: this.tableStateChange,
    };

    let dialogPromise: Promise<any>;

    switch (this.overlayType()) {
      case 'fullscreen':
        dialogPromise = this.overlayService.openFullScreen(MultiSelectDataTableDialog, {
          disableClose: false,
          data: dialogData,
        });
        break;
      case 'bottomsheet':
        dialogPromise = this.overlayService.openBottomSheet(MultiSelectDataTableDialog, {
          disableClose: false,
          data: dialogData,
        });
        break;
      case 'backdrop':
        dialogPromise = this.overlayService.openBackdrop(MultiSelectDataTableDialog, {
          disableClose: false,
          data: dialogData,
        });
        break;
      case 'modal':
      default:
        dialogPromise = this.overlayService.openModal(MultiSelectDataTableDialog, {
          disableClose: false,
          maxHeightClass: 'max-h-[80vh]',
          data: dialogData,
        });
        break;
    }

    dialogPromise.then((result: any[] | any) => {
      if (result !== undefined) {
        this.formControl?.setValue(result);
        this.valueChange.emit(result);
      }
    });
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    this.formControl?.setValue([]);
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