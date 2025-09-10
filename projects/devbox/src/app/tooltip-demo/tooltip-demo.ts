import { Component } from '@angular/core';
import { TooltipDirective, TooltipPosition, TooltipTheme } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-tooltip-demo',
  imports: [TooltipDirective],
  templateUrl: './tooltip-demo.html',
})
export class TooltipDemo {
  TooltipPosition = TooltipPosition;
  TooltipTheme = TooltipTheme;
}