import {AfterContentInit, Component, input, OnInit, signal} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import { BaseControlValueAccessorV3 } from '../../core/base-control-value-accessor-v3';



@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss'
})
export class CheckboxComponent extends BaseControlValueAccessorV3<boolean> implements OnInit, AfterContentInit {
  title = input<string | null>();
  id = signal<string>('');

  ngOnInit(): void {
    this.id.set(this.getId());
  }

  protected override onValueReady(value: boolean): void {}

  onCheckboxSelected($event: Event, enterKeyPressed: boolean = false) {
    if (!this.disabled()) {
      this.markAsTouched();
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
