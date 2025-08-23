import {
  Component,
  input,
  output,
  signal,
  AfterContentInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, CommonModule } from '@angular/common';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { BaseControlValueAccessorV3 } from '../../../core/base-control-value-accessor-v3';
import { BaseInputComponent } from '../../../core/base-input/base-input.component';
import { HumanizeFormMessagesPipe } from '../../../core/humanize-form-messages.pipe';
import { AppSvgIconComponent } from '../../misc/app-svg-icon/app-svg-icon.component';
import { NgxMaskDirective } from '../input-mask/ngx-mask.directive';
interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    HumanizeFormMessagesPipe,
    AppSvgIconComponent,
    CommonModule,
    BaseInputComponent,
    NgxMaskDirective,
  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
})
export class TextInputComponent extends BaseControlValueAccessorV3<string | null>  implements OnInit, OnDestroy
{
 
  appearance = input<'fill' | 'outline'>('outline');
  type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'time'>('text');
  viewType = input<'text' | 'text-area'>('text');
  iconSrc = input<string | null>();
  actionIcon = input<string | null>();
  label = input<string | null>();
  fullWidth = input<boolean>(false);
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  mask = input<string | null>(null);
  debounceSearchEnabled = input<boolean>(true);
  isPrefixSelect = input<boolean>(false);
  prefixOptions = input<SelectOption[]>([]);
  defaultPrefixValue = input<string | null>(null);

  changeValue = output<string>();
  actionIconClicked = output();
  prefixChanged = output<string>();

  isFocused = signal(false);
  prefixControl = new FormControl('');


  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();


  ngOnInit(): void {
    this.input$
    .pipe(
      this.debounceSearchEnabled() ? debounceTime(1200) : (source) => source,
      takeUntil(this.destroy$)
    )
    .subscribe((value) => this.changeValue.emit(value));

    this.prefixControl.setValue(this.defaultPrefixValue());
  }

  protected override onValueReady(value: string | null): void {
    console.log('onValueReady:', value);
    this.input$?.next(value ?? '');
  }

  onPrefixChanged(value: string) {
    console.log('onPrefixChanged:', value);
    this.prefixChanged.emit(value);
  }

  getClass() {
    let cls = '';
    if (this.fullWidth()) {
      cls += 'w-full ';
    }
    return cls;
  }

  onActionClicked() {
    console.log('onActionClicked');
    this.actionIconClicked.emit();
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.onTouched();
    this.isFocused.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}