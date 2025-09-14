import { AfterContentInit, Component, computed, input, output, signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInput } from '../../../../core/base-input/base-input';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-radio-group-field',
  standalone: true,
  imports: [
    BaseInput,
    NgClass,
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIcon,
    NgStyle,
  ],
  templateUrl: './radio-group-field.html',
})
export class RadioGroupField<T> extends BaseControlValueAccessor<T | null> implements AfterContentInit {
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
  width = input<'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl' | 'full' | string>('md');
  maxVisibleItems = input<number | null>(null);
  showErrorSpace = input<boolean>(true);

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

  showMore = computed(() =>
    !this.showAll() &&
    this.maxVisibleItems() !== null &&
    this.options().length > this.maxVisibleItems()!
  );

  showLess = computed(() =>
    this.showAll() &&
    this.maxVisibleItems() !== null
  );

  containerClass = computed(() => ({
    'w-full': this.width() === 'full',
    'w-11/12': this.width() === '3xl',
    'w-10/12': this.width() === 'xxl',
    'w-9/12': this.width() === 'xl',
    'w-8/12': this.width() === 'lg',
    'w-6/12': this.width() === 'md',
    'w-4/12': this.width() === 'sm',
    [this.width()]: typeof this.width() === 'string' && !['sm', 'md', 'lg', 'xl', 'xxl', '3xl', 'full'].includes(this.width())
  }));

  isSelected = computed(() => (item: T) =>
    this.getValueId(item) === this.formControl.value || this.selectedItem() === item
  );

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
    if (this.dynamicIconColorPath()) {
      return this.getNestedProperty(item, this.dynamicIconColorPath()) || this.iconColor();
    }
    return this.iconColor();
  });

  displayText = computed(() => (item: T): string | null => {
    if (!item) return null;
    if (this.displayProperty()) return this.getNestedProperty(item, this.displayProperty());
    if (this.displayTemplate()) return resolveTemplateWithObject(item, this.displayTemplate()!);
    return String(item);
  });

  protected override onValueReady(value: T | null): void {
    const matchingItem = value != null
      ? this.options().find((item) => this.getValueId(item) === value)
      : null;
    this.selectedItem.set(matchingItem ?? null);
  }

  protected onItemChange(item: T): void {
    if (this.formControl.disabled) return;

    this.markTouched();
    const value = this.getValueId(item);
    this.selectedItem.set(item);
    this.onValueChange(value);
  }

  protected onCustomActionClick(): void {
    if (!this.formControl.disabled) {
      this.customActionClick.emit();
    }
  }

  protected showAllItems(): void {
    if (!this.formControl.disabled) {
      this.showAll.set(true);
    }
  }

  protected hideExtraItems(): void {
    if (!this.formControl.disabled) {
      this.showAll.set(false);
    }
  }

  getValueId(item: T): any {
    return this.valueProperty() ? this.getNestedProperty(item, this.valueProperty()) : item;
  }

  private getNestedProperty(item: T, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], item as any);
  }
}