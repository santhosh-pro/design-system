import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  FlexibleConnectedPositionStrategy,
  GlobalPositionStrategy,
  Overlay,
} from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AlertDialog } from './alert-dialog/alert-dialog';

@Injectable({
  providedIn: 'root'
})
export class OverlayStore {
  private dialog = inject(Dialog);
  private overlay = inject(Overlay);
  private breakpointObserver = inject(BreakpointObserver);
  private rendererFactory = inject(RendererFactory2);

  private renderer!: Renderer2;
  private activeDialogRef: DialogRef<any, any> | null = null; // Track active dialog

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  private basePanelClass = ['bg-white', 'shadow-2', 'z-50']; // Added z-50 for stacking

  modalMaxHeightClass = 'max-h-[80vh]';

  openNearElement<T>(
    component: ComponentType<T>,
    triggerElement: HTMLElement,
    options?: {
      positionPreference?:
        | 'topLeft'
        | 'topRight'
        | 'topCenter'
        | 'bottomLeft'
        | 'bottomRight'
        | 'bottomCenter'
        | 'leftTop'
        | 'leftCenter'
        | 'leftBottom'
        | 'rightTop'
        | 'rightCenter'
        | 'rightBottom'
        | 'center';
      disableClose?: boolean;
      data?: any;
      scrollStrategy?: 'noop' | 'block' | 'reposition' | 'close';
      isMobileResponsive?: boolean;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    const {
      positionPreference = 'center',
      disableClose = false,
      data,
      scrollStrategy = 'block',
      isMobileResponsive = false,
      onClose,
      backdropOptions,
    } = options ?? {};

    const isMobile = this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small]);

    let positionStrategy: FlexibleConnectedPositionStrategy | GlobalPositionStrategy;

    const positionMappings: any = {
      bottomRight: [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
      ],
      bottomCenter: [
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
      ],
      bottomLeft: [
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
      ],
      topRight: [
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
      ],
      topCenter: [
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
      ],
      topLeft: [
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
      ],
      leftBottom: [
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
      ],
      leftCenter: [
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
      ],
      leftTop: [
        { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -8 },
      ],
      rightBottom: [
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
      ],
      rightCenter: [
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
      ],
      rightTop: [
        { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
      ],
      center: [
        { originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' },
      ],
    };

    if (isMobile && isMobileResponsive) {
      positionStrategy = this.overlay
        .position()
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

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening dialog with ID:', dialogId);

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      scrollStrategy: appliedScrollStrategy,
      disableClose: disableClose,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      panelClass: [...this.basePanelClass, 'rounded-3xl'],
      data: data,
      autoFocus: false,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    this.activeDialogRef = dialogRef as DialogRef<any, any>;

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Dialog closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Dialog close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openAlert(
    title: string, 
    message: string, 
    options?: { 
      onClose?: (result: boolean) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<boolean> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const { onClose, backdropOptions } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening alert dialog with ID:', dialogId);

    const dialogRef = this.dialog.open(AlertDialog, {
      width: '300px',
      data: { title, message },
      panelClass: [...this.basePanelClass, 'rounded-3xl'],
      autoFocus: false,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      providers: [
        { provide: DIALOG_DATA, useValue: { title, message } }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, false, dialogId);

    this.activeDialogRef = dialogRef;

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Alert dialog closed with ID:', dialogId, 'Result:', result);
          onClose?.(!!result);
          this.activeDialogRef = null;
          resolve(!!result);
        },
        (error) => {
          console.error('Alert dialog close error for ID:', dialogId, error);
          onClose?.(false);
          this.activeDialogRef = null;
          resolve(false);
        }
      );
    });
  }

  openModal<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      maxHeightClass?: string;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening modal with ID:', dialogId);

    const { disableClose = false, maxHeightClass, data, onClose, backdropOptions } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      panelClass: [...this.basePanelClass, 'w-max-[300px]', 'h-[70%]', 'rounded-t-3xl', 'overflow-clip', 'overflow-y-scroll'],
      data: data,
      autoFocus: false,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    this.activeDialogRef = dialogRef;

    this.setOverlayMaxHeight(maxHeightClass ?? this.modalMaxHeightClass);

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Modal closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Modal close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openBackdrop<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening backdrop with ID:', dialogId);

    const { disableClose = false, data, onClose, backdropOptions } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      panelClass: [...this.basePanelClass, 'w-[100%]', 'h-[90%]', 'rounded-t-3xl', 'overflow-clip'],
      data: data,
      autoFocus: false,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    this.activeDialogRef = dialogRef;

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Backdrop closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Backdrop close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openBottomSheet<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening bottom sheet with ID:', dialogId);

    const { disableClose = false, data, onClose, backdropOptions } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      panelClass: [...this.basePanelClass, 'w-max-[300px]', 'h-[70%]', 'rounded-t-3xl', 'overflow-clip', 'overflow-y-scroll'],
      data: data,
      autoFocus: false,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    this.activeDialogRef = dialogRef;

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Bottom sheet closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Bottom sheet close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openFullScreen<T>(
    component: ComponentType<T>,
    options?: {
      disableClose?: boolean;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening full screen with ID:', dialogId);

    const { disableClose = false, data, onClose, backdropOptions } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .bottom('0px');

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      panelClass: [...this.basePanelClass, 'w-dvw', 'h-dvh', 'overflow-clip', 'overflow-y-scroll'],
      data: data,
      autoFocus: false,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    this.activeDialogRef = dialogRef;

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Full screen closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Full screen close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openSidePanelRight<T>(
    component: ComponentType<T>,
    options?: {
      widthInPx?: number;
      disableClose?: boolean;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening side panel with ID:', dialogId);

    const {
      widthInPx = 350,
      disableClose = true,
      data,
      onClose,
      backdropOptions,
    } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .top('0px')
      .right('0px');

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      width: `${widthInPx}px`,
      panelClass: [...this.basePanelClass, 'h-dvh', 'overflow-clip', 'overflow-y-scroll'],
      data: data,
      autoFocus: false,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    this.activeDialogRef = dialogRef;

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Side panel closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Side panel close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  openSidePanelLeft<T>(
    component: ComponentType<T>,
    options?: {
      widthInPx?: number;
      disableClose?: boolean;
      data?: any;
      onClose?: (result: any) => void;
      backdropOptions?: {
        showBackdrop?: boolean;
        blur?: boolean;
        backdropClass?: string[];
        blurIntensity?: number; // 0-100, default 5
      };
    }
  ): Promise<any> {
    // Close existing dialog if open
    if (this.activeDialogRef) {
      console.log('Closing existing dialog:', this.activeDialogRef.id);
      this.activeDialogRef.close();
    }

    const dialogId = Math.random().toString(36).substring(2);
    console.log('Opening side panel left with ID:', dialogId);

    const {
      widthInPx = 350,
      disableClose = false,
      data,
      onClose,
      backdropOptions,
    } = options ?? {};

    // Configure backdrop options
    const {
      showBackdrop = true,
      blur = false,
      backdropClass: customBackdropClass = [],
      blurIntensity = 5,
    } = backdropOptions ?? {};

    // Build backdrop configuration
    const backdropConfig = this.buildBackdropConfig(showBackdrop, blur, customBackdropClass, blurIntensity);

    const positionStrategy = this.overlay
      .position()
      .global()
      .top('0px')
      .left('0px');

    const dialogRef = this.dialog.open(component, {
      positionStrategy: positionStrategy,
      disableClose: disableClose,
      width: `${widthInPx}px`,
      panelClass: [...this.basePanelClass, 'h-dvh', 'overflow-clip', 'overflow-y-scroll'],
      data: data,
      autoFocus: false,
      hasBackdrop: backdropConfig.hasBackdrop,
      backdropClass: backdropConfig.backdropClass,
      providers: [
        { provide: DIALOG_DATA, useValue: data }
      ]
    });

    this.activeDialogRef = dialogRef;

    // Handle backdrop click after dialog is opened
    this.setupBackdropClick(dialogRef, disableClose, dialogId);

    return new Promise((resolve) => {
      dialogRef.closed.subscribe(
        (result) => {
          console.log('Side panel left closed with ID:', dialogId, 'Result:', result);
          onClose?.(result);
          this.activeDialogRef = null;
          resolve(result);
        },
        (error) => {
          console.error('Side panel left close error for ID:', dialogId, error);
          onClose?.(null);
          this.activeDialogRef = null;
          resolve(null);
        }
      );
    });
  }

  private buildBackdropConfig(
    showBackdrop: boolean,
    blur: boolean,
    customBackdropClass: string[],
    blurIntensity: number
  ) {
    if (!showBackdrop) {
      // No backdrop at all
      return {
        hasBackdrop: false,
        backdropClass: []
      };
    }

    if (blur) {
      // Blur backdrop with optional intensity
      const blurValue = blurIntensity > 0 ? `${blurIntensity}px` : '5px';
      return {
        hasBackdrop: true,
        backdropClass: [
          'bg-black/20',
          `backdrop-blur-[${blurValue}]`,
          ...customBackdropClass
        ]
      };
    }

    // Default semi-transparent backdrop
    return {
      hasBackdrop: true,
      backdropClass: ['bg-black/20', ...customBackdropClass]
    };
  }

  private setupBackdropClick(dialogRef: DialogRef<any, any>, disableClose: boolean, dialogId: string): void {
    if (disableClose) {
      // If disableClose is true, don't subscribe to backdrop clicks
      return;
    }

    dialogRef.backdropClick.subscribe(() => {
      console.log('Backdrop clicked for dialog:', dialogId);
      dialogRef.close();
    });
  }

  private setOverlayMaxHeight(maxHeightClass: string): void {
    const overlayElement = document.querySelector('.base-overlay') as HTMLElement;
    if (overlayElement) {
      this.renderer.addClass(overlayElement, maxHeightClass);
    }
  }
}
