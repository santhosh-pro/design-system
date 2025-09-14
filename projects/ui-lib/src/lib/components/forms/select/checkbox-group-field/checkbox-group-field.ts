import { AfterContentInit, Component, computed, input, output, signal, SimpleChanges } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';
import { BaseInput } from '../../../../core/base-input/base-input';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { HumanizeFormMessagesPipe } from '../../../misc/humanize-form-messages';
import { Shimmer } from '../../../feedback/shimmer/shimmer';

interface State<T> {
  loading: () => boolean;
  success: () => boolean;
  failed: () => boolean;
  error: () => string | null;
}

@Component({
  selector: 'ui-checkbox-group-field',
  standalone: true,
  imports: [
    BaseInput,
    HumanizeFormMessagesPipe,
    Shimmer,
    NgClass,
    AppSvgIcon,
    NgStyle,
  ],
  templateUrl: './checkbox-group-field.html',

})
export class CheckboxGroupField<T> extends BaseControlValueAccessor<T[]> implements AfterContentInit {
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
  state = input<State<any>>();

  // Outputs
  customActionClick = output<void>();

  // Signals
  selectedItems = signal<T[]>([]);
  showAll = signal(false);

  // Computed
  hasRequiredField = computed(() => this.hasRequiredValidator());
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

  isSelected = computed(() => (item: T) => {
    const controlValue = this.selectedItems() ?? [];
    const identifierPath = this.valueProperty() ?? '';
    const value = this.getValueId(item);
    return controlValue.some(x => {
      if (identifierPath === '') return x === item;
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
      return propertyValue === value;
    });
  });

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

  constructor() {
    super();
  }

  override ngAfterContentInit(): void {
    if (this.formControl && this.formControl.value == null) {
      this.formControl.setValue([]);
    }
  }

  protected onValueReady(value: T[] | null): void {
    this.updateValue();
  }

  updateValue() {
    const formValue = this.formControl.value;
    if (!Array.isArray(formValue)) {
      this.selectedItems.set([]);
      return;
    }
    const items = formValue.map(x => this.getObjectUsingIdentifierValue(x)).filter((item): item is T => item !== undefined);
    this.selectedItems.set(items);
  }

  getObjectUsingIdentifierValue(value: any): T | undefined {
    if (this.valueProperty() == null || this.valueProperty() === '') {
      return value;
    }
    const identifierPath = this.valueProperty()!;
    return this.options().find(item => {
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], item as any);
      return propertyValue === value;
    });
  }

  getValueId(item: T): any {
    if (!this.valueProperty()) {
      return item;
    }
    const object = item as any;
    return this.valueProperty()!.split('.').reduce((acc, part) => acc && acc[part], object);
  }

  onItemClicked(item: T) {
    if (this.formControl.disabled) return;

    this.markTouched();
    const selectedItems = [...this.selectedItems()];
    const identifierPath = this.valueProperty() ?? '';
    const value = this.getValueId(item);
    const isSelected = selectedItems.some(x => {
      if (identifierPath === '') return x === item;
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
      return propertyValue === value;
    });

    let newSelectedItems: T[];
    if (isSelected) {
      newSelectedItems = selectedItems.filter(x => {
        if (identifierPath === '') return x !== item;
        const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
        return propertyValue !== value;
      });
    } else {
      newSelectedItems = [...selectedItems, item];
    }

    this.selectedItems.set(newSelectedItems);
    const newValue = newSelectedItems.map(item => this.getValueId(item));
    this.onValueChange(newValue);
  }

  showAllItems() {
    if (!this.formControl.disabled) {
      this.showAll.set(true);
    }
  }

  shrinkItems() {
    if (!this.formControl.disabled) {
      this.showAll.set(false);
    }
  }

  onCustomActionClick() {
    if (!this.formControl.disabled) {
      this.customActionClick.emit();
    }
  }

  private getNestedProperty(item: T, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], item as any);
  }
}