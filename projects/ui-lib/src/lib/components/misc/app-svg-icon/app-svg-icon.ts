import {Component, input, Input} from '@angular/core';
import { SvgIconComponent } from './lib/svg-icon';

@Component({
  selector: 'ui-svg-icon',
  standalone: true,
  imports: [
    SvgIconComponent
  ],
  templateUrl: './app-svg-icon.html',
})
export class AppSvgIcon {

  src = input.required<string>();
  stretch = input(false);
  size = input(24);
  svgStyle = input<{ [key: string]: any }>({});
}
