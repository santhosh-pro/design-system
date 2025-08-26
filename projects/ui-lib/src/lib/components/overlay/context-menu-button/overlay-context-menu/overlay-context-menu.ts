import {Component, inject, output} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import {ContextMenuButtonAction} from '../context-menu-button';
import { AppSvgIconComponent } from '../../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'app-overlay-context-menu',
  imports: [
    AppSvgIconComponent,
  ],
  templateUrl: './overlay-context-menu.html',
  styleUrl: './overlay-context-menu.scss'
})
export class OverlayContextMenuComponent {

  dialogRef = inject(DialogRef);
  actions: ContextMenuButtonAction[] = inject(DIALOG_DATA);

  _onActionClicked($event: MouseEvent, action: ContextMenuButtonAction) {
    this.dialogRef.close(action.actionKey);
    $event.stopPropagation();
  }
}
