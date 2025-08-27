import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkConnectedOverlay, Overlay } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { deepEqual } from '../../../../core/core-utils';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { CheckboxComponent } from '../../checkbox/checkbox';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

export enum MultiSelectDropdownAppearance {
  standard,
  csv,
  chips,
}

@Component({
  selector: 'ui-multi-select-dropdown',
  standalone: true,
  imports: [BaseInputComponent, NgClass, HumanizeFormMessagesPipe, CdkConnectedOverlay, CheckboxComponent, FormsModule],
  templateUrl: './multi-select-dropdown.html',
})
export class MultiSelectDropdownComponent<T> extends BaseControlValueAccessor<T[]> implements AfterContentInit {
  private cdr = inject(ChangeDetectorRef);
  private renderer = inject(Renderer2);
  private overlay = inject(Overlay);

  // Inputs
  label = input<string | null>(null);
  options = input.required<T[]>();
  placeholder = input<string>('Select');
  displayProperty = input<string | null>(null);
  displayTemplate = input<string | null>(null);
  valueProperty = input<string>('');
  identifierProperty = input<string>('id');
  searchKey = input<string | null>(null);
  noDataMessage = input<string>('No options available');
  isFullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  enableSearch = input<boolean>(false);
  addActionLabel = input<string | null>(null);
  minimumPopupWidth = input<number>(250);
  appearance = input<MultiSelectDropdownAppearance>(MultiSelectDropdownAppearance.standard);

  // Outputs
  addAction = output<void>();

  // Signals
  isDropdownOpen = signal(false);
  highlightedIndex = signal(-1);
  isDropUp = signal(false);
  dropdownWidth = signal(300);
  selectedOptions = signal<T[]>([]);
  filteredOptions = signal<T[]>([]);

  // ViewChild References
  private dropdownButton = viewChild.required<ElementRef<HTMLDivElement>>('dropdownButton');
  private dropdownListContainer = viewChild<ElementRef<HTMLDivElement>>('dropdownListContainer');
  private dropdownList = viewChild<ElementRef<HTMLDivElement>>('dropdownList');
  private searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');

  // Overlay Configuration
  scrollStrategy = this.overlay.scrollStrategies.block();
  MultiSelectDropdownAppearance = MultiSelectDropdownAppearance;

  override ngAfterContentInit(): void {
    this.onValueReady(this.formControl.value);
  }

  protected override onValueReady(value: any[] | null): void {
    if (!value) {
      this.formControl.setValue([], { emitEvent: false });
      this.selectedOptions.set([]);
    } else {
      this.updateSelectedOptions(value);
      this.filteredOptions.set(this.options());
    }
  }

  // Event Handlers
  protected onToggleDropdown(): void {
    this.isDropdownOpen.update((prev) => !prev);
    if (this.isDropdownOpen()) {
      this.filteredOptions.set(this.options());
      this.updateHighlightedIndex();
      this.adjustDropdownPosition();
      this.updateDropdownWidth();
      this.cdr.detectChanges();
      this.setDropdownMaxHeight();
      this.scrollToHighlightedOption();

      if (this.enableSearch()) {
        const searchField = this.searchField()?.nativeElement;
        if (searchField) {
          searchField.focus();
        }
      }
    }
  }

  protected onItemSelect(item: T): void {
  this.markTouched();
  let updatedValue = (this.formControl.value as any[]) ?? [];
  const isSelected = this.isOptionSelected(item);

  if (isSelected) {
    if (this.valueProperty()) {
      const itemValue = this.getValue(item);
      updatedValue = updatedValue.filter(v => v !== itemValue);
    } else if (this.identifierProperty()) {
      const itemId = this.getIdentifier(item);
      updatedValue = updatedValue.filter(v => this.getIdentifier(v) !== itemId);
    } else {
      updatedValue = updatedValue.filter(v => !deepEqual(v, item));
    }
  } else {
    if (this.valueProperty()) {
      updatedValue = [...updatedValue, this.getValue(item)];
    } else {
      updatedValue = [...updatedValue, item];
    }
  }

  this.formControl.setValue(updatedValue);
  this.updateSelectedOptions(updatedValue);
  this.onValueChange(updatedValue);
  this.cdr.detectChanges();
}

  protected onSearchInput(event: Event): void {
    const searchKeyword = (event.target as HTMLInputElement).value;
    if (this.enableSearch()) {
      this.updateFilteredOptions(searchKeyword);
    } else {
      const firstMatch = this.findFirstMatch(searchKeyword);
      const index = this.filteredOptions().findIndex((item) => item === firstMatch);
      this.highlightedIndex.set(index);
    }
  }

  protected onClearSearch(): void {
    const searchField = this.searchField()?.nativeElement;
    if (searchField) {
      searchField.value = '';
      this.filteredOptions.set(this.options());
      this.highlightedIndex.set(0);
      this.scrollToHighlightedOption();
      searchField.focus();
    }
  }

 protected onSelectAll(): void {
  let updatedValue: any[];
  if (this.valueProperty()) {
    updatedValue = this.options().map(item => this.getValue(item));
  } else {
    updatedValue = [...this.options()];
  }
  this.formControl.setValue(updatedValue);
  this.updateSelectedOptions(updatedValue);
  this.onValueChange(updatedValue);
  this.cdr.detectChanges();
}

  protected onClearSelection(): void {
  const updatedValue: any[] = [];
  this.formControl.setValue(updatedValue);
  this.updateSelectedOptions(updatedValue);
  this.onValueChange(updatedValue);
  this.cdr.detectChanges();
}

protected isAllSelected(): boolean {
  const controlValue = (this.formControl.value as any[]) ?? [];
  return this.options().length > 0 && this.options().every(item => this.isOptionSelected(item));
}

  protected onAddAction(): void {
    this.addAction.emit();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (this.isDropdownOpen()) {
      this.adjustDropdownPosition();
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.isDropdownOpen()) return;

    switch (event.key) {
      case 'ArrowDown':
        if (this.highlightedIndex() < this.filteredOptions().length - 1) {
          this.highlightedIndex.update((prev) => prev + 1);
        }
        this.scrollToHighlightedOption();
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.highlightedIndex() > 0) {
          this.highlightedIndex.update((prev) => prev - 1);
        }
        this.scrollToHighlightedOption();
        event.preventDefault();
        break;
      case 'Enter':
        if (this.filteredOptions()[this.highlightedIndex()]) {
          this.onItemSelect(this.filteredOptions()[this.highlightedIndex()]);
        }
        event.preventDefault();
        break;
      case 'Escape':
        this.isDropdownOpen.set(false);
        event.preventDefault();
        break;
    }

    if (!this.enableSearch() && event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
      const matchingIndex = this.filteredOptions().findIndex((item) => {
        const resolvedText = this.searchKey()
          ? resolveTemplateWithObject(item as any, `$${this.searchKey()}`)
          : this.getDisplayText(item);
        return resolvedText?.toLowerCase().startsWith(event.key.toLowerCase());
      });

      if (matchingIndex !== -1) {
        this.highlightedIndex.set(matchingIndex);
        this.scrollToHighlightedOption();
      }
    }
  }

  protected onClickOutside(): void {
    this.isDropdownOpen.set(false);
  }

  // Utility Methods
 protected isOptionSelected(item: T): boolean {
  const controlValue = (this.formControl.value as any[]) ?? [];
  if (this.valueProperty()) {
    const itemValue = this.getValue(item);
    return controlValue.some(v => v === itemValue);
  } else if (this.identifierProperty()) {
    const itemId = this.getIdentifier(item);
    return controlValue.some(v => this.getIdentifier(v) === itemId);
  }
  return controlValue.some(v => deepEqual(v, item));
}

  protected getCsvDisplay(): string | null {
    const selected = this.selectedOptions();
    const csv = selected
      .map((item) => {
        const displayString = this.getDisplayText(item);
        return typeof displayString === 'string' ? displayString : '';
      })
      .filter((str) => str)
      .join(', ');

    return csv || null;
  }

  protected getDisplayText(item: T | null): string | null {
    if (!item) return null;

    if (this.displayProperty()) {
      return this.displayProperty()!.split('.').reduce((acc: any, part: string) => acc && acc[part], item) ?? null;
    }

    if (this.displayTemplate()) {
      return resolveTemplateWithObject(item as any, this.displayTemplate()!) ?? null;
    }

    return String(item);
  }

  private getValue(item: T): unknown {
    if (!this.valueProperty()) return item;
    return this.valueProperty().split('.').reduce((acc: any, part: string) => acc && acc[part], item);
  }

  private getAllValues(): unknown[] {
    return this.selectedOptions().map((item) => this.getValue(item));
  }

  private getObjectFromValue(v: unknown): T | undefined {
    if (!this.valueProperty()) return v as T;
    return this.options().find(item => this.getValue(item) === v);
  }

  private getIdentifier(item: T): unknown {
    if (!this.identifierProperty()) return item;
    return this.identifierProperty().split('.').reduce((acc: any, part: string) => acc && acc[part], item);
  }

  private isObjectEqual(a: T, b: T): boolean {
    if (this.identifierProperty()) {
      return this.getIdentifier(a) === this.getIdentifier(b);
    } else {
      return deepEqual(a, b);
    }
  }

  private updateSelectedOptions(updatedValue: any[]): void {
    const selected = updatedValue.map(v => this.getObjectFromValue(v));
    this.selectedOptions.set(selected.filter((s): s is T => s != null));
  }

  private updateFilteredOptions(searchKeyword?: string): void {
    if (!searchKeyword || searchKeyword.trim() === '') {
      this.filteredOptions.set(this.options());
      this.highlightedIndex.set(0);
      return;
    }

    const filtered = this.options().filter((item) => {
      const displayString = this.getDisplayText(item);
      return typeof displayString === 'string' && displayString.toLowerCase().includes(searchKeyword.toLowerCase());
    });

    this.filteredOptions.set(filtered);
    this.updateHighlightedIndex();
  }

  private findFirstMatch(searchKeyword?: string): T | null {
    if (!searchKeyword || searchKeyword.trim() === '') return null;
    return (
      this.filteredOptions().find((item) => {
        const displayString = this.getDisplayText(item);
        return typeof displayString === 'string' && displayString.toLowerCase().includes(searchKeyword.toLowerCase());
      }) || null
    );
  }

  private updateHighlightedIndex(): void {
    this.highlightedIndex.set(0);
  }

  private updateDropdownWidth(): void {
    const buttonWidth = this.dropdownButton().nativeElement.offsetWidth;
    this.dropdownWidth.set(Math.max(buttonWidth, this.minimumPopupWidth()));
  }

  private setDropdownMaxHeight(): void {
    const buttonRect = this.dropdownButton().nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const maxHeight = this.isDropUp() ? spaceAbove - 36 : spaceBelow - 36;

    const dropdownListContainer = this.dropdownListContainer()?.nativeElement;
    if (dropdownListContainer) {
      this.renderer.setStyle(dropdownListContainer, 'max-height', `${maxHeight}px`);
    }
  }

  private adjustDropdownPosition(): void {
    const buttonRect = this.dropdownButton().nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    this.isDropUp.set(spaceAbove > spaceBelow && spaceBelow < 200);
  }

  private scrollToHighlightedOption(): void {
    const dropdownList = this.dropdownList()?.nativeElement;
    if (dropdownList && dropdownList.children[this.highlightedIndex()]) {
      const highlightedItem = dropdownList.children[this.highlightedIndex()] as HTMLElement;
      highlightedItem.scrollIntoView({ block: 'nearest' });
    }
  }
}