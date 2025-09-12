import { Component, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { TooltipPosition, TooltipTheme } from './tooltip.enums';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="tooltip"
         [ngClass]="tooltipClasses()"
         [class.tooltip--visible]="visible()"
         [style.left]="left() + 'px'"
         [style.top]="top() + 'px'">
      {{tooltip()}}
    </div>
  `,
  styleUrl: './tooltip.css',
})
export class Tooltip {
  tooltipPosition = input<TooltipPosition>(TooltipPosition.DEFAULT);
  tooltipTheme = input<TooltipTheme>(TooltipTheme.DEFAULT);
  tooltip = input<string>('');
  left = input<number>(0);
  top = input<number>(0);
  visible = input<boolean>(false);

  // Computed signal for CSS classes
  tooltipClasses = computed(() => [
    `tooltip--${this.tooltipPosition()}`,
    `tooltip--${this.tooltipTheme()}`
  ]);
}