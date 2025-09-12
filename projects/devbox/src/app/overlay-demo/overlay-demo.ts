import { Component, inject, signal } from '@angular/core';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card';
import { DocIoList } from '../core/doc-io-list/doc-io-list';
import { BaseOverlay, Button, ContextMenuButtonAction, ContextMenuButton, OverlayStore } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-overlay-demo',
  standalone: true,
  imports: [
    DemoCard,
    Button,
    ContextMenuButton,
    DocIoList
  ],
  templateUrl: './overlay-demo.html'
})
export class OverlayDemo {
  private overlayService = inject(OverlayStore);

  // Signals for results
  alertResult = signal<boolean | null>(null);
  contextActionResult = signal<string | null>(null);
  backClickResult = signal<string | null>(null);
  sidePanelResult = signal<any | null>(null);
  fullScreenResult = signal<any | null>(null);

  // Context menu actions
  contextActions = signal<ContextMenuButtonAction[]>([
    { label: 'Edit', actionKey: 'edit', iconPath: '/assets/edit.svg' },
    { label: 'Delete', actionKey: 'delete', iconPath: '/assets/delete.svg' },
    { label: 'Share', actionKey: 'share', iconPath: '/assets/share.svg' }
  ]);

  // Demo files for code viewer
  alertFiles = signal<DemoFile[]>([
    {
      name: 'alert-demo.component.html',
      language: 'html',
      code: `<ui-button
  buttonColor="bg-primary-500"
  (click)="openBasicAlert()">
  Open Alert
</ui-button>`
    },
    {
      name: 'alert-demo.component.ts',
      language: 'ts',
      code: `openBasicAlert() {
  this.overlayService.openAlert('Confirm Action', 'Are you sure you want to proceed?')
    .then(result => this.alertResult.set(result));
}`
    }
  ]);

  contextMenuFiles = signal<DemoFile[]>([
    {
      name: 'context-menu-demo.component.html',
      language: 'html',
      code: `<ui-context-menu-button
  [contextActions]="contextActions()"
  positionPreference="bottomRight"
  (actionClick)="onContextActionClick($event)">
</ui-context-menu-button>`
    },
    {
      name: 'context-menu-demo.component.ts',
      language: 'ts',
      code: `contextActions = signal<ContextMenuButtonAction[]>([
  { label: 'Edit', actionKey: 'edit', iconPath: '/assets/edit.svg' },
  { label: 'Delete', actionKey: 'delete', iconPath: '/assets/delete.svg' },
  { label: 'Share', actionKey: 'share', iconPath: '/assets/share.svg' }
]);
onContextActionClick(action: string) {
  this.contextActionResult.set(action);
}`
    }
  ]);

  baseOverlayFiles = signal<DemoFile[]>([
    {
      name: 'base-overlay-demo.component.html',
      language: 'html',
      code: `<ui-button
  buttonColor="bg-primary-500"
  (click)="openBaseOverlay()">
  Open Overlay
</ui-button>`
    },
    {
      name: 'base-overlay-demo.component.ts',
      language: 'ts',
      code: `openBaseOverlay() {
  this.overlayService.openModal(BaseOverlayComponent, {
    data: { title: 'Sample Overlay' },
    showBackButton: true
  }).then(() => this.backClickResult.set('Back clicked'));
}`
    }
  ]);

  sidePanelFiles = signal<DemoFile[]>([
    {
      name: 'side-panel-demo.component.html',
      language: 'html',
      code: `<ui-button
  buttonColor="bg-primary-500"
  (click)="openSidePanel()">
  Open Side Panel
</ui-button>`
    },
    {
      name: 'side-panel-demo.component.ts',
      language: 'ts',
      code: `openSidePanel() {
  this.overlayService.openSidePanelRight(BaseOverlayComponent, {
    widthInPx: 400,
    data: { title: 'Right Side Panel' }
  }).then(result => this.sidePanelResult.set(result));
}`
    }
  ]);

  fullScreenFiles = signal<DemoFile[]>([
    {
      name: 'full-screen-demo.component.html',
      language: 'html',
      code: `<ui-button
  buttonColor="bg-primary-500"
  (click)="openFullScreen()">
  Open Full Screen
</ui-button>`
    },
    {
      name: 'full-screen-demo.component.ts',
      language: 'ts',
      code: `openFullScreen() {
  this.overlayService.openFullScreen(BaseOverlayComponent, {
    data: { title: 'Full Screen Overlay' }
  }).then(result => this.fullScreenResult.set(result));
}`
    }
  ]);

  openBasicAlert() {
    this.overlayService.openAlert('Confirm Action', 'Are you sure you want to proceed?')
      .then(result => this.alertResult.set(result));
  }

  onContextActionClick(action: string) {
    this.contextActionResult.set(action);
  }

  openBaseOverlay() {
    this.overlayService.openModal(BaseOverlay, {
      data: { title: 'Sample Overlay' },
      disableClose: false
    }).then(() => this.backClickResult.set('Back clicked'));
  }

  openSidePanel() {
    this.overlayService.openSidePanelRight(BaseOverlay, {
      widthInPx: 400,
      data: { title: 'Right Side Panel Example' },
      onClose() {
        console.log('Side panel closed');
      },
    }).then(result => this.sidePanelResult.set(result));
  }

  openFullScreen() {
    this.overlayService.openFullScreen(BaseOverlay, {
      data: { title: 'Full Screen Overlay' }
    }).then(result => this.fullScreenResult.set(result));
  }
}