import {Component, OnInit} from '@angular/core';
import {NgClass} from "@angular/common";
import {TooltipPosition, TooltipTheme} from "./tooltip.enums";

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent implements OnInit {
  tooltipPosition: TooltipPosition = TooltipPosition.DEFAULT;
  tooltipTheme: TooltipTheme = TooltipTheme.DEFAULT;
  tooltip = '';
  left = 0;
  top = 0;
  visible = false;

  constructor() {
  }

  ngOnInit(): void {
  }
}
