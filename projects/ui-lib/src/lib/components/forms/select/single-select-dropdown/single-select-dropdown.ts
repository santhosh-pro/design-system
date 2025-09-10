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
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

@Component({
  selector: 'ui-single-select-dropdown',
  imports: [BaseInputComponent, NgClass, HumanizeFormMessagesPipe, CdkConnectedOverlay, FormsModule],
  templateUrl: './single-select-dropdown.html',
  styleUrl: './single-select-dropdown.css'
})
export class SingleSelectDropdown<T> extends BaseControlValueAccessor<T | null> implements AfterContentInit {
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
  noDataMessage = input<string>('No options available');
  isFullWidth = input<boolean>(false);
  showErrorSpace = input<boolean>(false);
  enableSearch = input<boolean>(true);
  enableClientSearch = input<boolean>(true);
  minimumPopupWidth = input<number>(250);

  // Outputs
  search = output<string>();

  // Signals
  isDropdownOpen = signal(false);
  highlightedIndex = signal(-1);
  isDropUp = signal(false);
  dropdownWidth = signal(300);
  selectedOption = signal<T | null>(null);
  filteredOptions = signal<T[]>([]);

  // ViewChild References
  private dropdownButton = viewChild.required<ElementRef<HTMLDivElement>>('dropdownButton');
  private dropdownListContainer = viewChild<ElementRef<HTMLDivElement>>('dropdownListContainer');
  private dropdownList = viewChild<ElementRef<HTMLDivElement>>('dropdownList');
  private searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');

  // Overlay Configuration
  scrollStrategy = this.overlay.scrollStrategies.block();

  override ngAfterContentInit(): void {
    this.onValueReady(this.formControl.value);
  }

  protected override onValueReady(value: any | null): void {
    if (!value) {
      this.formControl.setValue(null, { emitEvent: false });
      this.selectedOption.set(null);
    } else {
      this.updateSelectedOption(value);
      this.filteredOptions.set(this.options());
    }
  }

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
    const isSelected = this.isOptionSelected(item);

    if (isSelected) {
      this.formControl.setValue(null);
      this.selectedOption.set(null);
    } else {
      const newValue = this.valueProperty() ? this.getValue(item) : item;
      this.formControl.setValue(newValue as T);
      this.selectedOption.set(item);
    }

    this.onValueChange(this.formControl.value);
    this.isDropdownOpen.set(false);
    this.cdr.detectChanges();
  }

  protected onSearchInput(event: Event): void {
    const searchKeyword = (event.target as HTMLInputElement).value;
    if (this.enableSearch()) {
      if (this.enableClientSearch()) {
        this.updateFilteredOptions(searchKeyword);
      } else {
        this.search.emit(searchKeyword);
        this.filteredOptions.set(this.options());
      }
    }
  }

  protected onClearSearch(): void {
    const searchField = this.searchField()?.nativeElement;
    if (searchField) {
      searchField.value = '';
      if (this.enableClientSearch()) {
        this.filteredOptions.set(this.options());
      } else {
        this.search.emit('');
      }
      this.highlightedIndex.set(0);
      this.scrollToHighlightedOption();
      searchField.focus();
    }
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
        const resolvedText = this.getDisplayText(item);
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

  protected isOptionSelected(item: T): boolean {
    const controlValue = this.formControl.value;
    if (!controlValue) return false;

    if (typeof item === 'string' && typeof controlValue === 'string') {
      return item === controlValue;
    }

    if (this.valueProperty()) {
      const itemValue = this.getValue(item);
      return controlValue === itemValue;
    } else if (this.identifierProperty()) {
      const itemId = this.getIdentifier(item);
      return this.getIdentifier(controlValue) === itemId;
    }
    return deepEqual(controlValue, item);
  }

  protected getDisplayText(item: T | null): string | null {
    if (!item) return null;

    if (typeof item === 'string') {
      return item;
    }

    if (this.displayProperty()) {
      return this.displayProperty()!.split('.').reduce((acc: any, part: string) => acc && acc[part], item) ?? null;
    }

    if (this.displayTemplate()) {
      return resolveTemplateWithObject(item as any, this.displayTemplate()!) ?? null;
    }

    return String(item);
  }

  private getValue(item: T): unknown {
    if (typeof item === 'string' || !this.valueProperty()) return item;
    return this.valueProperty().split('.').reduce((acc: any, part: string) => acc && acc[part], item);
  }

  private getIdentifier(item: T): unknown {
    if (typeof item === 'string' || !this.identifierProperty()) return item;
    return this.identifierProperty().split('.').reduce((acc: any, part: string) => acc && acc[part], item);
  }

  private updateSelectedOption(value: any): void {
    const selected = this.options().find(item => {
      if (typeof item === 'string' && typeof value === 'string') {
        return item === value;
      }
      if (this.valueProperty()) {
        return this.getValue(item) === value;
      } else if (this.identifierProperty()) {
        return this.getIdentifier(item) === this.getIdentifier(value);
      }
      return deepEqual(item, value);
    });
    this.selectedOption.set(selected || null);
  }

  private updateFilteredOptions(searchKeyword: string): void {
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
