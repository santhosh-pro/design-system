import {Component, input, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'ui-status-badge',
  imports: [
    NgClass
  ],
  templateUrl: './status-badge.html',
  standalone: true,
})
export class StatusBadge {
  status = input.required<string | null | undefined>();
  backgroundColorClass = input.required<string | null>();
  indicatorColor = input<string | null>();
  textColorClass = input.required<string | null>();
  borderColorClass = input.required<string | null>();
  isUpperCase = input<boolean>(false);
}
