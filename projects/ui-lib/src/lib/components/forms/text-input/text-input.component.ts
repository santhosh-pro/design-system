import {
  Component,
  input,
  output,
  signal,
  AfterContentInit,
  OnDestroy,
  OnInit,
  computed,
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
export class TextInputComponent extends BaseControlValueAccessorV3<string | null> implements OnInit, OnDestroy {
  // Inputs (unchanged)
  appearance = input<'fill' | 'outline'>('outline');
  type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'time'>('text');
  viewType = input<'text' | 'textarea'>('text');
  iconSrc = input<string | null>(null);
  actionIcon = input<string | null>(null);
  label = input<string | null>(null);
  fullWidth = input<boolean>(false);
  placeholder = input<string>('');
  showErrorSpace = input<boolean>(false);
  mask = input<string | null>(null);
  debounceSearchEnabled = input<boolean>(true);
  hasPrefixSelect = input<boolean>(false);
  prefixOptions = input<SelectOption[]>([]);
  defaultPrefixValue = input<string | null>(null);

  // Outputs
  actionClick = output<void>(); // Updated name
  prefixChange = output<string>();

  // Signals and other properties (unchanged)
  isFocused = signal(false);
  prefixControl = new FormControl<string>('');
  protected inputClass = computed(() => (this.fullWidth() ? 'w-full' : ''));

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.setupInputDebounce();
    this.prefixControl.setValue(this.defaultPrefixValue() ?? '', { emitEvent: false });
  }

  private setupInputDebounce(): void {
    this.input$
      .pipe(
        debounceTime(this.debounceSearchEnabled() ? 1200 : 0),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.valueChange.emit(value));
  }

  protected override onValueReady(value: string | null): void {
    this.input$.next(value ?? '');
  }

  protected onInput(value: string | null): void {
    this.onValueReady(value);
  }

  protected onPrefixChange(value: string): void {
    this.prefixChange.emit(value);
  }

  protected onActionClick(): void {
    this.actionClick.emit();
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.markTouched();
    this.isFocused.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}