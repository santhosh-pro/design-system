import { AfterContentInit, Component, computed, input, output, signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-single-selection-field',
  standalone: true,
  imports: [
    BaseInputComponent,
    NgClass,
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    NgStyle,
  ],
  templateUrl: './single-selection-field.html',
  styleUrl: './single-selection-field.scss',
})
export class SingleSelectionFieldComponent<T> extends BaseControlValueAccessor<T | null> implements AfterContentInit {
  // Inputs
  label = input<string | null>(null);
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
  emptyMessage = input<string>('');
  customActionText = input<string>('');
  fullWidth = input<boolean>(false);
  itemWidth = input<number | null>(null);
  isItemCentered = input<boolean>(false);
  showSelectionTick = input<boolean>(true);
  itemPlacement = input<'start' | 'space-between'>('start');
  maxVisibleItems = input<number | null>(null);

  // Outputs
  customActionClick = output<void>();

  // Signals
  selectedItem = signal<T | null>(null);
  showAll = signal(false);

  // Computed
  visibleItems = computed(() =>
    this.showAll() || this.maxVisibleItems() === null
      ? this.options()
      : this.options().slice(0, this.maxVisibleItems()!)
  );

  showMore = computed(() => !this.showAll() && this.maxVisibleItems() !== null && this.options().length > this.maxVisibleItems()!);

  showLess = computed(() => this.showAll() && this.maxVisibleItems() !== null);

  containerClass = computed(() => ({
    'justify-start': this.itemPlacement() === 'start',
    'justify-between': this.itemPlacement() === 'space-between',
  }));

  itemStyle = computed(() => ({
    width: this.itemWidth() ? `${this.itemWidth()}px` : null,
  }));

  itemClass = computed(() => (item: T) => ({
    'border-primary-600': this.isSelected()(item),
    'justify-center': this.isItemCentered(),
  }));

  isSelected = computed(() => (item: T) => this.getValueId(item) === this.formControl.value || this.selectedItem() === item);

  iconType = computed(() => (item: T): 'svg' | 'url' | null => {
    if (this.iconSrc() || this.dynamicIconPath()) return 'svg';
    if (this.imageUrl() || this.dynamicImageUrlPath()) return 'url';
    return null;
  });

  icon = computed(() => (item: T): string | null => {
    if (this.iconSrc()) return this.iconSrc();
    if (this.dynamicIconPath()) return this.getNestedProperty(item, this.dynamicIconPath());
    if (this.imageUrl()) return this.imageUrl();
    if (this.dynamicImageUrlPath()) return this.getNestedProperty(item, this.dynamicImageUrlPath());
    return null;
  });

   itemIconColor = computed(() => (item: T): string | null => {
    if (this.iconColor()) return this.iconColor();
    if (this.dynamicIconColorPath()) return this.getNestedProperty(item, this.dynamicIconColorPath()) || this.iconColor();
    return this.iconColor();
  });

  displayText = computed(() => (item: T): string | null => {
    if (!item) return null;
    if (this.displayProperty()) return this.getNestedProperty(item, this.displayProperty());
    if (this.displayTemplate()) return resolveTemplateWithObject(item, this.displayTemplate()!);
    return String(item);
  });

  protected override onValueReady(value: T | null): void {
    const matchingItem = value != null ? this.options().find((item) => this.getValueId(item) === value) : null;
    this.selectedItem.set(matchingItem ?? null);
  }

  protected onItemClick(item: T): void {
    this.markTouched();
    const value = this.getValueId(item);
    if (value === this.formControl.value) {
      // Deselect if clicking the same item
      this.selectedItem.set(null);
      this.onValueChange(null);
    } else {
      // Select new item
      this.selectedItem.set(item);
      this.onValueChange(value);
    }
  }

  protected onCustomActionClick(): void {
    this.customActionClick.emit();
  }

  protected onItemKeydown(event: KeyboardEvent, item: T): void {
    if (event.key === 'Enter') {
      this.onItemClick(item);
      event.preventDefault();
    }
  }

  protected showAllItems(): void {
    this.showAll.set(true);
  }

  protected hideExtraItems(): void {
    this.showAll.set(false);
  }

  private getValueId(item: T): any {
    return this.valueProperty() ? this.getNestedProperty(item, this.valueProperty()) : item;
  }

  private getNestedProperty(item: T, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], item as any);
  }
}