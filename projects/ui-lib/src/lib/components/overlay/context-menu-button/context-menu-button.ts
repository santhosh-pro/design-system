import {Component, ElementRef, inject, input, OnDestroy, output, ViewChild} from '@angular/core';
import {FlexibleConnectedPositionStrategy, GlobalPositionStrategy, Overlay} from "@angular/cdk/overlay";
import {Dialog, DialogRef} from "@angular/cdk/dialog";
import {Subscription} from "rxjs";
import {OverlayContextMenuComponent} from './overlay-context-menu/overlay-context-menu';

@Component({
  selector: 'ui-context-menu-button',
  imports: [],
  templateUrl: './context-menu-button.html',
  standalone: true,
  styleUrl: './context-menu-button.scss'
})
export class ContextMenuButtonComponent implements OnDestroy {

  @ViewChild('trigger', {static: true}) trigger!: ElementRef;
  overlay = inject(Overlay);
  dialog = inject(Dialog);

  actions = input<ContextMenuButtonAction[]>();
  positionPreference = input<'topLeft' | 'topRight' | 'topCenter' |
    'bottomLeft' | 'bottomRight' | 'bottomCenter' |
    'leftTop' | 'leftCenter' | 'leftBottom' |
    'rightTop' | 'rightCenter' | 'rightBottom' |
    'center'>('bottomCenter');
  onActionClicked = output<string>();

  private basePanelClass = ['bg-white', 'shadow-2'];

  private dialogRef?: DialogRef<any, OverlayContextMenuComponent>;
  private subscription?: Subscription;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onMenuClicked() {

    let positionStrategy: FlexibleConnectedPositionStrategy | GlobalPositionStrategy | null;
    let scrollStrategy: 'noop' | 'block' | 'reposition' | 'close' = 'block';

    let disableClose = false;

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

    positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.trigger)
      .withFlexibleDimensions(false)
      .withPush(true)
      .withPositions(positionMappings[this.positionPreference()] || positionMappings.bottomCenter);


    const scrollStrategyMapping = {
      noop: this.overlay.scrollStrategies.noop(),
      block: this.overlay.scrollStrategies.block(),
      reposition: this.overlay.scrollStrategies.reposition(),
      close: this.overlay.scrollStrategies.close(),
    };

    const appliedScrollStrategy = scrollStrategyMapping[scrollStrategy] ?? this.overlay.scrollStrategies.block();

    this.dialogRef = this.dialog.open(OverlayContextMenuComponent, {
      positionStrategy: positionStrategy,
      scrollStrategy: appliedScrollStrategy,
      disableClose: disableClose,
      backdropClass: ['overflow-clip'],
      panelClass: [...this.basePanelClass, 'rounded-xl', 'overflow-clip'],
      data: this.actions()
    });

    this.subscription = this.dialogRef.closed.subscribe((actionKey: string) => {
      this.onActionClicked.emit(actionKey);
    });
  }
}


export interface ContextMenuButtonAction {
  iconPath?: string;
  label: string;
  actionKey: string;
}
