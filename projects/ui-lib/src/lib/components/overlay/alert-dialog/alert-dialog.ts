import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import { ButtonComponent } from '../../forms/button/button';

@Component({
  selector: 'ui-alert-dialog',
  standalone: true,
  imports: [
    ButtonComponent,
  ],
  templateUrl: './alert-dialog.html',
})
export class AlertDialogComponent {

  dialogRef = inject(DialogRef);
  data = inject(DIALOG_DATA);

  onNoClicked() {
    this.dialogRef.close(false);
  }

  onYesClicked() {
    this.dialogRef.close(true);
  }
}
