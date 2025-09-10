import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterContentInit, ChangeDetectorRef, Component, computed, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AppSvgIconComponent } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { CdkConnectedOverlay, Overlay } from '@angular/cdk/overlay';
@Component({
  selector: 'ui-single-selection-auto-complete',
  imports: [
    BaseInputComponent,
    NgClass,
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    NgStyle,
    CdkConnectedOverlay,
    FormsModule,
  ],
  templateUrl: './single-selection-auto-complete.html',
})
export class SingleSelectionAutoComplete<T> extends BaseControlValueAccessor<T | null> implements AfterContentInit {
private cdr = inject(ChangeDetectorRef);
  private overlay = inject(Overlay);

  // Inputs
  label = input<string | null>(null);
  placeholder = input<string>('Search...');
  options = input<T[]>([]);
  displayProperty = input<string>('');
  displayTemplate = input<string | null>(null);
  iconSrc = input<string | null>(null);
  dynamicIconPath = input<string>('');
  imageUrl = input<string | null>(null);
  dynamicImageUrlPath = input<string>('');
  iconColor = input<string>('');
  dynamicIconColorPath = input<string>('');
  valueProperty = input<string>('');
  fullWidth = input<boolean>(false);
  itemWidth = input<number | null>(null);
  debounceTimeMs = input<number>(300);
  noDataMessage = input<string>('No options available');
  minimumPopupWidth = input<number>(250);

  // Outputs
  searchChange = output<string>();
  customActionClick = output<void>();

  // Signals
  searchText = signal<string>('');
  showDropdown = signal<boolean>(false);
  dropdownWidth = signal<number>(0);
  isDropUp = signal<boolean>(false);
  highlightedIndex = signal<number>(-1);
  isImageLoaded = signal<Map<T, boolean>>(new Map());

  // ViewChild References
  private inputContainer = viewChild.required<ElementRef<HTMLDivElement>>('inputContainer');
  private dropdownListContainer = viewChild<ElementRef<HTMLDivElement>>('dropdownListContainer');
  private dropdownList = viewChild<ElementRef<HTMLDivElement>>('dropdownList');
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Overlay Configuration
  scrollStrategy = this.overlay.scrollStrategies.block();

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor() {
    super();
    this.setupSearch();
  }

  protected override onValueReady(value: T | null): void {
    const matchingItem = value != null ? this.options().find((item) => this.getValueId(item) === value) : null;
    this.searchText.set(matchingItem ? this.displayText()(matchingItem) || '' : '');
    this.updateDropdownWidth();
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.searchText.set(searchTerm);
    this.showDropdown.set(true);
    this.highlightedIndex.set(0);
    this.searchSubject.next(searchTerm);
    this.searchChange.emit(searchTerm);
    this.updateDropdownWidth();
    this.adjustDropdownPosition();
    this.cdr.detectChanges();
  }

  protected onItemClick(item: T): void {
    this.markTouched();
    const value = this.getValueId(item);
    this.searchText.set(this.displayText()(item) || '');
    this.showDropdown.set(false);
    this.onValueChange(value);
    this.cdr.detectChanges();
  }

  protected onCustomActionClick(): void {
    this.customActionClick.emit();
  }

  protected onClickOutside(): void {
    this.showDropdown.set(false);
    this.cdr.detectChanges();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.showDropdown()) return;

    switch (event.key) {
      case 'ArrowDown':
        if (this.highlightedIndex() < this.visibleItems().length - 1) {
          this.highlightedIndex.update((prev) => prev + 1);
          this.scrollToHighlightedOption();
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.highlightedIndex() > 0) {
          this.highlightedIndex.update((prev) => prev - 1);
          this.scrollToHighlightedOption();
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (this.visibleItems()[this.highlightedIndex()]) {
          this.onItemClick(this.visibleItems()[this.highlightedIndex()]);
        }
        event.preventDefault();
        break;
      case 'Escape':
        this.showDropdown.set(false);
        event.preventDefault();
        break;
    }
  }

  protected onImageLoad(item: T, event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.complete && img.naturalHeight !== 0) {
      this.isImageLoaded.update(map => {
        map.set(item, true);
        return new Map(map);
      });
      this.cdr.detectChanges();
    }
  }



  // Computed
  visibleItems = computed(() => this.options());

  itemStyle = computed(() => ({
    width: this.itemWidth() ? `${this.itemWidth()}px` : '100%',
  }));

  itemClass = computed(() => (item: T) => ({
    'bg-blue-50': this.isSelected()(item),
    'bg-gray-100': this.highlightedIndex() === this.visibleItems().indexOf(item),
  }));

  isSelected = computed(() => (item: T) => this.getValueId(item) === this.formControl.value);

  iconType = computed(() => (item: T): 'svg' | 'url' | null => {
    const dynamicIcon = this.dynamicIconPath() ? this.getNestedProperty(item, this.dynamicIconPath()) : null;
    const dynamicImage = this.dynamicImageUrlPath() ? this.getNestedProperty(item, this.dynamicImageUrlPath()) : null;
    if (this.iconSrc() || dynamicIcon) return 'svg';
    if (this.imageUrl() || dynamicImage) return 'url';
    return null;
  });

  icon = computed(() => (item: T): string | null => {
    if (this.iconSrc()) return this.iconSrc();
    if (this.dynamicIconPath()) {
      const path = this.getNestedProperty(item, this.dynamicIconPath());
      return path ? String(path) : null;
    }
    if (this.imageUrl()) return this.imageUrl();
    if (this.dynamicImageUrlPath()) {
      const path = this.getNestedProperty(item, this.dynamicImageUrlPath());
      return path ? String(path) : 'assets/images/placeholder.png';
    }
    return null;
  });

  itemIconColor = computed(() => (item: T): string | null => {
    if (this.iconColor()) return this.iconColor();
    if (this.dynamicIconColorPath()) {
      const color = this.getNestedProperty(item, this.dynamicIconColorPath());
      return color ? String(color) : this.iconColor();
    }
    return this.iconColor();
  });

  displayText = computed(() => (item: T): string | null => {
    if (!item) return null;
    if (this.displayProperty()) {
      const value = this.getNestedProperty(item, this.displayProperty());
      return value ? String(value) : null;
    }
    if (this.displayTemplate()) return resolveTemplateWithObject(item, this.displayTemplate()!);
    return String(item);
  });

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTimeMs()),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.searchChange.emit(searchTerm);
    });
  }

  private getValueId(item: T): any {
    return this.valueProperty() ? this.getNestedProperty(item, this.valueProperty()) : item;
  }

  private getNestedProperty(item: T, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], item as any);
  }

  private updateDropdownWidth(): void {
    const inputWidth = this.inputContainer().nativeElement.offsetWidth;
    this.dropdownWidth.set(Math.max(inputWidth, this.minimumPopupWidth()));
  }

  private adjustDropdownPosition(): void {
    const inputRect = this.inputContainer().nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
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
