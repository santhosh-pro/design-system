import {Component, inject} from '@angular/core';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import { ButtonComponent } from '../../forms/button/button';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [
    ButtonComponent,
  ],
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.css'
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
