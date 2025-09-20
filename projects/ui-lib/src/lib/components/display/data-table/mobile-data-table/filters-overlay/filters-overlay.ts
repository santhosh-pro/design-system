import { Component, Inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

interface FiltersOverlayData {
  title?: string;
  template: TemplateRef<any>;
}

@Component({
  selector: 'ui-mobile-filters-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filters-overlay.html'
})
export class MobileFiltersOverlay {
  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: FiltersOverlayData
  ) {}

  close(result?: any): void {
    this.dialogRef.close(result);
  }
}
