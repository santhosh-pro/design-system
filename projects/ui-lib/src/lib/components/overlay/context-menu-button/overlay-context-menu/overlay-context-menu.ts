import {Component, inject, output} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import {ContextMenuButtonAction} from '../context-menu-button';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-overlay-context-menu',
  imports: [
    AppSvgIcon,
  ],
  templateUrl: './overlay-context-menu.html',
})
export class OverlayContextMenu {

  dialogRef = inject(DialogRef);
  actions: ContextMenuButtonAction[] = inject(DIALOG_DATA);

  onActionClick($event: MouseEvent, action: ContextMenuButtonAction) {
    this.dialogRef.close(action.actionKey);
    $event.stopPropagation();
  }
}
