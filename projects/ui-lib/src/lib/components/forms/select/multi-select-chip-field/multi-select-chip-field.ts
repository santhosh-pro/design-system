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
  selector: 'ui-multi-select-chip-field',
  standalone: true,
  imports: [
    BaseInput,
    HumanizeFormMessagesPipe,
    Shimmer,
    NgClass,
    AppSvgIcon,
    NgStyle,
  ],
  templateUrl: './multi-select-chip-field.html',

})
export class MultiSelectChipField<T> extends BaseControlValueAccessor<T[]> implements AfterContentInit {
  title = input<string | null>();
  items = input<T[]>([]);
  display = input<string | null>();
  displayTemplate = input<string | null>();
  iconSrc = input<string | null>();
  dynamicIconPath = input<string>();
  imageUrl = input<string | null>();
  dynamicImageUrlPath = input<string>();
  value = input<string | null>(null);
  identifier = input<string>('id');
  noDataMessage = input<string>();
  state = input<State<any>>();
  iconColor = input<string>();
  dynamicIconColor = input<string>();
  customActionText = input<string>();
  fullWidth = input<boolean>(false);
  itemWidth = input<number | null>(null);
  isItemCentered = input<boolean>(false);
  showSelectionTickMark = input<boolean>(true);
  maximumDisplayItems = input<number | null>(null);

  onCustomActionClicked = output<void>();
  showAll = signal(false);
  selectedItems = signal<T[]>([]);
  hasRequiredField = computed(() => this.hasRequiredValidator());

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

  getVisibleItems(): T[] {
    if (this.showAll()) return this.items();
    return this.maximumDisplayItems() !== null ? this.items().slice(0, this.maximumDisplayItems()!) : this.items();
  }

  showMoreButton(): boolean {
    return !this.showAll() && this.maximumDisplayItems() !== null && this.items().length > this.maximumDisplayItems()!;
  }

  showLessButton(): boolean {
    return this.showAll() && this.maximumDisplayItems() !== null;
  }

  showAllItems() {
    this.showAll.set(true);
  }

  shrinkItems() {
    this.showAll.set(false);
  }

  getObjectUsingIdentifierValue(value: any): T | undefined {
    if (this.identifier() == null || this.identifier() === '') {
      return value;
    }
    const identifierPath = this.identifier()!;
    return this.items().find(item => {
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], item as any);
      return propertyValue === value;
    });
  }

  getDisplayString(item: T): any {
    if (!item) return null;
    const object = item as any;
    if (this.display() != null && this.display() != '') {
      return this.display()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }
    if (this.displayTemplate() != null && this.displayTemplate() != '') {
      return resolveTemplateWithObject(object, this.displayTemplate()!);
    }
    return item;
  }

  getValue(item: T): any {
    if (!this.value()) {
      return item;
    }
    const object = item as any;
    return this.value()!.split('.').reduce((acc, part) => acc && acc[part], object);
  }

  getIdentifier(item: T): any {
    if (!this.identifier()) {
      return item;
    }
    const object = item as any;
    return this.identifier()!.split('.').reduce((acc, part) => acc && acc[part], object);
  }

  isItemExistInNormalSelectionList(item: T) {
    const controlValue = this.selectedItems() ?? [];
    const identifierPath = this.identifier() ?? '';
    const value = this.getIdentifier(item);
    return controlValue.some(x => {
      if (identifierPath === '') return x === item;
      const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
      return propertyValue === value;
    });
  }

  onItemClicked(item: T) {
    this.markTouched();
    const selectedItems = [...this.selectedItems()];
    const identifierPath = this.identifier() ?? '';
    const value = this.getIdentifier(item);
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
    const newValue = newSelectedItems.map(item => this.getValue(item));
    this.onValueChange(newValue);
  }

  getImageType(item: T): 'svg' | 'url' | null {
    if (this.iconSrc() != null && this.iconSrc() != '') {
      return 'svg';
    }
    if (this.dynamicIconPath() != null && this.dynamicIconPath() != '') {
      return 'svg';
    }
    if (this.imageUrl() != null && this.imageUrl() != '') {
      return 'url';
    }
    if (this.dynamicImageUrlPath() != null && this.dynamicImageUrlPath() != '') {
      return 'url';
    }
    return null;
  }

  getDynamicIcon(item: T): string | null | undefined {
    if (this.iconSrc() != null && this.iconSrc() != '') {
      return this.iconSrc();
    }
    if (this.dynamicIconPath() != null && this.dynamicIconPath() != '') {
      const object = item as any;
      return this.dynamicIconPath()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }
    if (this.imageUrl() != null && this.imageUrl() != '') {
      return this.imageUrl();
    }
    if (this.dynamicImageUrlPath() != null && this.dynamicImageUrlPath() != '') {
      const object = item as any;
      return this.dynamicImageUrlPath()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }
    return null;
  }

  getDynamicIconColor(item: T): string | null | undefined {
    if (this.iconColor()) {
      return this.iconColor();
    }
    if (this.dynamicIconColor() == null || this.dynamicIconColor() == '') {
      return this.iconColor();
    }
    const object = item as any;
    const color = this.dynamicIconColor()!.split('.').reduce((acc, part) => acc && acc[part], object);
    return color;
  }

  customActionClicked() {
    this.onCustomActionClicked.emit();
  }

  handleKeydown(event: KeyboardEvent, item: T) {
    if (event.key === 'Enter') {
      this.onItemClicked(item);
      event.preventDefault();
    }
  }
}