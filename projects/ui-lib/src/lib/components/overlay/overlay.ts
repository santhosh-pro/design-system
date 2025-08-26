import {inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {Dialog, DialogRef} from '@angular/cdk/dialog';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  GlobalPositionStrategy,
  Overlay,
} from '@angular/cdk/overlay';
import {ComponentType} from '@angular/cdk/portal';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {AlertDialogComponent} from './alert-dialog/alert-dialog';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  private dialog = inject(Dialog);
  private overlay = inject(Overlay);
  private breakpointObserver = inject(BreakpointObserver);
  private rendererFactory = inject(RendererFactory2);

  private renderer!: Renderer2;

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  private basePanelClass = ['bg-white', 'shadow-2'];

  modalMaxHeightClass = 'max-h-[80vh]';

  openNearElement<T>(
    component: ComponentType<T>,
    triggerElement: HTMLElement,
    options?: {
      positionPreference?: 'topLeft' | 'topRight' | 'topCenter' |
    'bottomLeft' | 'bottomRight' | 'bottomCenter' |
    'leftTop' | 'leftCenter' | 'leftBottom' |
    'rightTop' | 'rightCenter' | 'rightBottom' |
    'center';
      disableClose?: boolean;
      data?: any;
      scrollStrategy?: 'noop' | 'block' | 'reposition' | 'close';
      isMobileResponsive?: boolean;
    }
  ): DialogRef<any, T> {

    const {
      positionPreference='center',
      disableClose = false,
      data,
      scrollStrategy = 'block',
      isMobileResponsive = false
    } = options ?? {};

    const isMobile = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);

    let positionStrategy: FlexibleConnectedPositionStrategy | GlobalPositionStrategy | null;

    const positionMappings: any = {
      // **BOTTOM POSITIONS**
      bottomRight: [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
      ],
      bottomCenter: [
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
      ],
      bottomLeft: [
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
      ],

      // **TOP POSITIONS**
      topRight: [
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
      ],
      topCenter: [
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
      ],
      topLeft: [
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
      ],

      // **LEFT POSITIONS**
      leftBottom: [
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
      ],
      leftCenter: [
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
      ],
      leftTop: [
        { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -8 },
      ],

      // **RIGHT POSITIONS**
      rightBottom: [
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
      ],
      rightCenter: [
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
      ],
      rightTop: [
        { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
      ],

      // **CENTER**
      center: [
        { originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' },
      ]
    };
    if (isMobile && isMobileResponsive) {
      positionStrategy = this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically();
    } else {
      positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withPositions(positionMappings[positionPreference] || positionMappings.bottomCenter);
}

    const scrollStrategyMapping = {
      noop: this.overlay.scrollStrategies.noop(),
      block: this.overlay.scrollStrategies.block(),
      reposition: this.overlay.scrollStrategies.reposition(),
      close: this.overlay.scrollStrategies.close(),
    };

    const appliedScrollStrategy = scrollStrategyMapping[scrollStrategy] ?? this.overlay.scrollStrategies.block();

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      scrollStrategy: appliedScrollStrategy,
      disableClose: disableClose,
      backdropClass: ['bg-black/5', 'overflow-clip'],
      panelClass: [...this.basePanelClass, 'rounded-3xl'],
      data: data,
    });

    return dialogRef;

  }

  openAlert(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '300px',
      data: { title, message },
      panelClass: [...this.basePanelClass, 'rounded-3xl']
    });
  
    return new Promise((resolve) => {
      dialogRef.closed.subscribe((result) => {
        resolve(!!result); // force to true/false
      });
    });
  }
  

  openModal<T>(component: ComponentType<T>, options?: {
    disableClose?: boolean,
    maxHeightClass?: string,
    data?: any
  }):
    DialogRef<any, T> {

    const {disableClose = false, maxHeightClass, data} = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      backdropClass: ['bg-black/20'],
      panelClass: [...this.basePanelClass, maxHeightClass ?? this.modalMaxHeightClass, 'rounded-3xl', 'sm:w-4/5', 'md:w-3/5', 'lg:w-2/5'],
      data: data
    });

    this.setOverlayMaxHeight(maxHeightClass ?? this.modalMaxHeightClass);

    return dialogRef;
  }

  private setOverlayMaxHeight(maxHeightClass: string): void {
    const overlayElement = document.querySelector('.base-overlay') as HTMLElement;
    if (overlayElement) {
      this.renderer.addClass(overlayElement, maxHeightClass);
    }
  }

  openBackdrop<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
    }
  ): DialogRef<any, T> {
    const {disableClose = false, data} = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      panelClass: [...this.basePanelClass, 'w-[100%]', 'h-[90%]', 'rounded-t-3xl', 'overflow-clip'],
      data: data
    });

    return dialogRef;
  }

  openBottomSheet<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
    }
  ): DialogRef<any, T> {
    const {disableClose = false, data} = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      panelClass: [...this.basePanelClass, 'w-max-[300px]', 'h-[70%]', 'rounded-t-3xl', 'overflow-clip', 'overflow-y-scroll'],
      data: data
    });

    return dialogRef;
  }

  openFullScreen<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
    }
  ): DialogRef<any, T> {
    const {disableClose = false, data} = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      panelClass: [...this.basePanelClass, 'w-dvw', 'h-dvh', 'overflow-clip', 'overflow-y-scroll'],
      data: data
    });

    return dialogRef;
  }

  openSidePanelRight<T>(
    component: ComponentType<T>,
    options?: {
      widthInPx?: number;
      disableClose?: boolean;
      data?: any;
    }
  ): DialogRef<any, T> {
    const {
      widthInPx = 350,
      disableClose = false,
      data
    } = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .top('0px')
      .right('0px')
      .width(`${widthInPx}px`);

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      panelClass: [...this.basePanelClass, 'h-dvh', 'w-full', 'overflow-clip', 'overflow-y-scroll'],
      data: data
    });

    return dialogRef;
  }

  openSidePanelLeft<T>(
    component: ComponentType<T>,
    options?: {
      widthInPx?: number;
      disableClose?: boolean;
      data?: any;
    }
  ): DialogRef<any, T> {
    const {
      widthInPx = 350,
      disableClose = false,
      data
    } = options ?? {};

    const positionStrategy = this.overlay
      .position()
      .global()
      .top('0px')
      .left('0px')
      .width(`${widthInPx}px`);

    let dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      panelClass: [...this.basePanelClass, 'h-dvh', 'w-full', 'overflow-clip', 'overflow-y-scroll'],
      data: data
    });

    return dialogRef;
  }

}
