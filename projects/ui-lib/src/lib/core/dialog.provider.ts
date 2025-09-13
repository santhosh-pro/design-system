// lib/providers/dialog.provider.ts
import { Provider } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

export function provideDialogRef(dialogRef?: DialogRef): Provider {
  return {
    provide: DialogRef,
    useValue: dialogRef || null
  };
}