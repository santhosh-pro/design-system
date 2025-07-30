import {Component, inject, output} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import {AppSvgIconComponent} from '../../app-svg-icon/app-svg-icon.component';
import {ContextMenuButtonAction} from '../context-menu-button.component';

@Component({
  selector: 'app-overlay-context-menu',
  imports: [
    AppSvgIconComponent,
  ],
  templateUrl: './overlay-context-menu.component.html',
  styleUrl: './overlay-context-menu.component.scss'
})
export class OverlayContextMenuComponent {

  dialogRef = inject(DialogRef);
  actions: ContextMenuButtonAction[] = inject(DIALOG_DATA);

  _onActionClicked($event: MouseEvent, action: ContextMenuButtonAction) {
    this.dialogRef.close(action.actionKey);
    $event.stopPropagation();
  }
}
