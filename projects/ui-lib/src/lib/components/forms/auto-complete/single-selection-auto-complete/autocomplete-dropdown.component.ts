import { Component, input, output, signal, computed, ChangeDetectorRef, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSvgIconComponent } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { NgStyle } from '@angular/common';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';

@Component({
  selector: 'ui-autocomplete-dropdown',
  standalone: true,
  imports: [CommonModule, AppSvgIconComponent, NgStyle],
  template: `
    <div
      #dropdownList
      class="bg-white rounded-md shadow-md ring-1 ring-gray-200 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      role="listbox"
      id="autocomplete-list"
    >
      @for (item of visibleItems(); track item; let i = $index) {
        <div
          class="flex items-center px-4 py-2 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
          [ngStyle]="itemStyle()"
          (click)="onItemClick(item)"
          [ngClass]="{
            'bg-blue-50': isSelected()(item),
            'bg-gray-100': highlightedIndex() === i
          }"
          role="option"
          [attr.aria-selected]="isSelected()(item)"
          tabindex="-1"
        >
          @if (icon()(item)) {
            @switch (iconType()(item)) {
              @case ('url') {
                <img
                  class="object-cover h-6 w-6 rounded-full"
                  [src]="icon()(item) || 'assets/images/placeholder.png'"
                  [alt]="displayText()(item) || 'Item icon'"
                  loading="lazy"
                  (load)="onImageLoad(item, $event)"
                />
              }
              @case ('svg') {
                <ui-svg-icon
                  [src]="icon()(item)!"
                  [size]="18"
                  [ngStyle]="{'color': itemIconColor()(item)}"
                />
              }
            }
          }

          <span class="text-sm text-gray-800 truncate flex-1">
            {{ displayText()(item) }}
          </span>
        </div>
      } @empty {
        <span class="block px-4 py-2 text-sm text-gray-500 select-none" role="option">
          {{ noDataMessage() }}
        </span>
      }
    </div>
  `,
})
export class AutocompleteDropdownComponent<T> {
  // Inputs
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
  itemWidth = input<number | null>(null);
  noDataMessage = input<string>('No options available');
  highlightedIndex = input<number>(-1);
  selectedValue = input<any>(null);

  // Outputs
  itemClick = output<T>();
  imageLoad = output<{ item: T; event: Event }>();
  highlightedIndexChange = output<number>(); // New output for keyboard navigation

  // ViewChild
  dropdownList = viewChild<ElementRef<HTMLDivElement>>('dropdownList');

  private cdr = inject(ChangeDetectorRef);

  // Computed
  visibleItems = computed(() => this.options());

  itemStyle = computed(() => ({
    width: this.itemWidth() ? `${this.itemWidth()}px` : '100%',
  }));

  isSelected = computed(() => (item: T) => this.getValueId(item) === this.selectedValue());

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

  constructor() {
    effect(() => {
      // Scroll to highlighted item when highlightedIndex changes
      this.scrollToHighlightedOption();
    });
  }

  onItemClick(item: T): void {
    this.itemClick.emit(item);
  }

  onImageLoad(item: T, event: Event): void {
    this.imageLoad.emit({ item, event });
  }

  private getValueId(item: T): any {
    return this.valueProperty() ? this.getNestedProperty(item, this.valueProperty()) : item;
  }

  private getNestedProperty(item: T, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], item as any);
  }

  scrollToHighlightedOption(): void {
    const dropdownList = this.dropdownList()?.nativeElement;
    if (dropdownList && dropdownList.children[this.highlightedIndex()]) {
      const highlightedItem = dropdownList.children[this.highlightedIndex()] as HTMLElement;
      highlightedItem.scrollIntoView({ block: 'nearest' });
    }
  }
}
