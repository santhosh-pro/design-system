import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  Injector,
  OnDestroy,
  ViewContainerRef,
  createComponent,
  input,
} from '@angular/core';
import { TooltipPosition, TooltipTheme } from './tooltip.enums';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  tooltip = input<string>('');
  toolTipPosition = input<TooltipPosition>(TooltipPosition.DEFAULT);
  theme = input<TooltipTheme>(TooltipTheme.DEFAULT);
  showDelay = input<number>(0);
  hideDelay = input<number>(0);

  private componentRef: ComponentRef<TooltipComponent> | null = null;
  private showTimeout?: number;
  private hideTimeout?: number;
  private touchTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private appRef: ApplicationRef,
    private injector: Injector,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.initializeTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.setHideTooltipTimeout();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove($event: MouseEvent): void {
    if (this.componentRef !== null && this.toolTipPosition() === TooltipPosition.DYNAMIC) {
      this.componentRef.setInput('left', $event.clientX);
      this.componentRef.setInput('top', $event.clientY);
      this.componentRef.setInput('tooltip', this.tooltip());
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart($event: TouchEvent): void {
    $event.preventDefault();
    window.clearTimeout(this.touchTimeout);
    this.touchTimeout = window.setTimeout(() => {
      this.initializeTooltip();
    }, 500);
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    window.clearTimeout(this.touchTimeout);
    this.setHideTooltipTimeout();
  }

  private initializeTooltip() {
    if (this.componentRef !== null) {
      return; // Prevent creating multiple tooltip instances
    }

    window.clearTimeout(this.hideTimeout);
    
    // Create component using the new createComponent API
    this.componentRef = createComponent(TooltipComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    this.appRef.attachView(this.componentRef.hostView);
    const [tooltipDOMElement] = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes;

    // Set all properties using setInput
    this.setTooltipComponentProperties();
    
    document.body.appendChild(tooltipDOMElement);

    // Use setTimeout to delay showing the tooltip
    this.showTimeout = window.setTimeout(() => {
      this.showTooltip();
    }, this.showDelay());
  }

  private setTooltipComponentProperties() {
    if (this.componentRef !== null) {
      this.componentRef.setInput('tooltip', this.tooltip());
      this.componentRef.setInput('tooltipPosition', this.toolTipPosition());
      this.componentRef.setInput('tooltipTheme', this.theme());
      this.componentRef.setInput('visible', false); // Start with false

      const { left, right, top, bottom } = this.elementRef.nativeElement.getBoundingClientRect();

      switch (this.toolTipPosition()) {
        case TooltipPosition.BELOW: {
          this.componentRef.setInput('left', Math.round((right - left) / 2 + left));
          this.componentRef.setInput('top', Math.round(bottom));
          break;
        }
        case TooltipPosition.ABOVE: {
          this.componentRef.setInput('left', Math.round((right - left) / 2 + left));
          this.componentRef.setInput('top', Math.round(top));
          break;
        }
        case TooltipPosition.RIGHT: {
          this.componentRef.setInput('left', Math.round(right));
          this.componentRef.setInput('top', Math.round(top + (bottom - top) / 2));
          break;
        }
        case TooltipPosition.LEFT: {
          this.componentRef.setInput('left', Math.round(left));
          this.componentRef.setInput('top', Math.round(top + (bottom - top) / 2));
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  private showTooltip() {
    if (this.componentRef !== null) {
      this.componentRef.setInput('visible', true);
    }
  }

  private setHideTooltipTimeout() {
    this.hideTimeout = window.setTimeout(() => {
      this.destroy();
    }, this.hideDelay());
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.componentRef !== null) {
      window.clearTimeout(this.showTimeout);
      window.clearTimeout(this.hideTimeout);
      window.clearTimeout(this.touchTimeout);
      
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}