import {
  AfterContentInit,
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";
import {FormControl, NgControl, ReactiveFormsModule} from "@angular/forms";
import {ShimmerComponent} from "../../components/shimmer/shimmer.component";
import {AppSvgIconComponent} from "../../components/app-svg-icon/app-svg-icon.component";
import { BaseControlValueAccessor } from '../../core/base-control-value-accessor';
import { BaseInputComponent } from '../../core/base-input/base-input.component';
import { HumanizeFormMessagesPipe } from '../../core/humanize-form-messages.pipe';
import { resolveTemplateWithObject } from '../../core/template-resolver';

@Component({
  selector: 'app-single-selection-field',
  standalone: true,
  imports: [
    BaseInputComponent,
    NgClass,
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    NgStyle,
    ShimmerComponent
  ],
  templateUrl: './single-selection-field.component.html',
  styleUrl: './single-selection-field.component.scss'
})
export class SingleSelectionFieldComponent<T> extends BaseControlValueAccessor implements AfterContentInit {
  title = input<string | null>();
  items = input<T[]>([]);
  display = input<string>();
  displayTemplate = input<string | null>();
  iconSrc = input<string | null>();
  dynamicIconPath = input<string>();
  imageUrl = input<string | null>();
  dynamicImageUrlPath = input<string>();
  iconColor = input<string>();
  dynamicIconColor = input<string>();
  value = input<string>();
  noDataMessage = input<string>();
  customActionText = input<string>();
  fullWidth = input(false);
  itemWidth = input<number | null>(null);
  isItemCentered = input<boolean>(false);
  showSelectionTickMark = input<boolean>(true);
  itemPlacement = input<'start' | 'space-between'>('start');
  maximumDisplayItems = input<number | null>(null);

  valueChanged = output<T | null>();
  onCustomActionClicked = output<void>();


  selectedItem = signal<T | null>(null);

  showAll = signal(false);

  errorMessages = signal<{ [key: string]: string }>({});
  ngControl = inject(NgControl, {optional: true, self: true});

  constructor() {
    super();
    if (this.ngControl) {
      this.ngControl!.valueAccessor = this;
    }
  }

  override onWriteValue(value: any): void {

  }

  ngAfterContentInit(): void {
    let formControl = this.ngControl?.control as FormControl;
    if (formControl) {
      this.formControl = this.ngControl?.control as FormControl;
    }
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

  getDisplayString(item: T): any {
    let object = item as any;
    if(object == null) {
      return null;
    }

    if(this.display() != null && this.display() != '') {
      return this.display()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }

    if(this.displayTemplate() != null && this.displayTemplate() != '') {
      return resolveTemplateWithObject(object, this.displayTemplate()!);
    }

    return item;
  }

  getPropertyId(item: T | null): any {
    if (this.value() == null || this.value() == '') {
      return item;
    }
    let object = item as any;
    return this.value()!.split('.').reduce((acc, part) => acc && acc[part], object);
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
      let object = item as any;
      return this.dynamicIconPath()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }

    if (this.imageUrl() != null && this.imageUrl() != '') {
      return this.imageUrl();
    }

    if (this.dynamicImageUrlPath() != null && this.dynamicImageUrlPath() != '') {
      let object = item as any;
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
    let object = item as any;
    const color = this.dynamicIconColor()!.split('.').reduce((acc, part) => acc && acc[part], object);
    return color;
  }

  onItemClicked(item: T) {
    this.markAsTouched();
    const value = this.getPropertyId(item);
    this.selectedItem.set(item);
    if (value == this.formControl.value) {
      this.onChange(null);
      this.valueChanged.emit(null);
    } else {
      this.onChange(value);
      this.valueChanged.emit(value);
    }
  }

  customActionClicked() {
    this.onCustomActionClicked.emit();
  }

  handleKeydown(event: KeyboardEvent, item: T) {
    switch (event.key) {
      case 'Enter':
        this.onItemClicked(item);
        event.preventDefault();
        break;
    }
  }
}
