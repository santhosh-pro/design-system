import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import { Button } from '../../forms/button/button';

@Component({
  selector: 'ui-alert-dialog',
  standalone: true,
  imports: [
    Button,
  ],
  templateUrl: './alert-dialog.html',
})
export class AlertDialog {

  dialogRef = inject(DialogRef);
  data = inject(DIALOG_DATA);

  onNoClicked() {
    this.dialogRef.close(false);
  }

  onYesClicked() {
    this.dialogRef.close(true);
  }
}
