import {AfterContentInit, Component, input, OnInit, signal} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';



@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss'
})
export class CheckboxComponent extends BaseControlValueAccessor<boolean> implements OnInit, AfterContentInit {
  title = input<string | null>();
  id = signal<string>('');

  ngOnInit(): void {
    this.id.set(this.getId());
  }

  protected override onValueReady(value: boolean): void {}

  onCheckboxSelected($event: Event, enterKeyPressed: boolean = false) {
    if (!this.isDisabled()) {
      this.markTouched();
      let checkbox = $event.target as HTMLInputElement;
      let value = ($event.target as HTMLInputElement).checked;
      if(enterKeyPressed) {
        value = !value;
        checkbox.checked = value;
      }
      this.onValueChange(value);
    }
  }

  private getId(): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `checkbox-${randomNumber.toString()}`;
  }

  handleKeydown($event: KeyboardEvent) {
   if($event.key == 'Enter') {
     this.onCheckboxSelected($event, true);
   }
  }
}
