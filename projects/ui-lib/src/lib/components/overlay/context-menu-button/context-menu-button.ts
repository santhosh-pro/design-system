import { Component, ElementRef, inject, input, output, signal, effect, OnDestroy } from '@angular/core';
import { FlexibleConnectedPositionStrategy, GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Subscription } from 'rxjs';
import { viewChild } from '@angular/core';
import { OverlayContextMenu } from './overlay-context-menu/overlay-context-menu';

@Component({
  selector: 'ui-context-menu-button',
  templateUrl: './context-menu-button.html',
  standalone: true,
})
export class ContextMenuButton implements OnDestroy {
  // Inputs
  contextActions = input<ContextMenuButtonAction[]>();
  positionPreference = input<
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
    | 'center'
  >('bottomCenter', { alias: 'positionPreference' });

  // Outputs
  actionClick = output<string>({ alias: 'actionClick' });

  // Signal-based ViewChild
  triggerRef = viewChild.required<ElementRef>('trigger');

  // Injections
  private overlay = inject(Overlay);
  private dialog = inject(Dialog);

  // Signals
  private dialogRef = signal<DialogRef<any, OverlayContextMenu> | undefined>(undefined);
  private subscription = signal<Subscription | undefined>(undefined);

  // Base panel classes
  private basePanelClass = ['bg-white', 'shadow-2'];

  constructor() {
    // Effect to handle dialog close subscription
    effect(() => {
      const ref = this.dialogRef();
      if (ref) {
        this.subscription.set(
          ref.closed.subscribe((actionKey: string) => {
            this.actionClick.emit(actionKey);
          })
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription()?.unsubscribe();
  }

  protected onMenuClick(): void {
    const positionMappings: any = {
      // BOTTOM POSITIONS
      bottomRight: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 }],
      bottomCenter: [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 }],
      bottomLeft: [{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 }],
      // TOP POSITIONS
      topRight: [{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }],
      topCenter: [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 }],
      topLeft: [{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 }],
      // LEFT POSITIONS
      leftBottom: [{ originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 }],
      leftCenter: [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 }],
      leftTop: [{ originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -8 }],
      // RIGHT POSITIONS
      rightBottom: [{ originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 }],
      rightCenter: [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 }],
      rightTop: [{ originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 }],
      // CENTER
      center: [{ originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' }],
    };

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.triggerRef())
      .withFlexibleDimensions(false)
      .withPush(true)
      .withPositions(positionMappings[this.positionPreference()] || positionMappings.bottomCenter);

    const scrollStrategyMapping = {
      noop: this.overlay.scrollStrategies.noop(),
      block: this.overlay.scrollStrategies.block(),
      reposition: this.overlay.scrollStrategies.reposition(),
      close: this.overlay.scrollStrategies.close(),
    };

    const scrollStrategy: 'noop' | 'block' | 'reposition' | 'close' = 'block';
    const appliedScrollStrategy = scrollStrategyMapping[scrollStrategy] ?? this.overlay.scrollStrategies.block();

    const disableClose = false;

    this.dialogRef.set(
      this.dialog.open(OverlayContextMenu, {
        positionStrategy,
        scrollStrategy: appliedScrollStrategy,
        disableClose,
        backdropClass: ['overflow-clip'],
        panelClass: [...this.basePanelClass, 'rounded-xl', 'overflow-clip'],
        data: this.contextActions(),
      })
    );
  }
}

export interface ContextMenuButtonAction {
  iconPath?: string;
  label: string;
  actionKey: string;
}