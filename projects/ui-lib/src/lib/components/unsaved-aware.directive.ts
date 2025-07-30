import {
  Directive,
  OnDestroy,
  HostListener,
  inject
} from '@angular/core';
import {FormGroupDirective} from '@angular/forms';
import {Router, NavigationStart, Event} from '@angular/router';
import {Subscription} from 'rxjs';
import { OverlayService } from './overlay/overlay.service';
import { NGL_CONFIG } from '../core/ngl-config.token';

@Directive({
  standalone: true,
  selector: 'form[unSavedAware]'
})
export class UnsavedAwareDirective implements OnDestroy {
  config = inject(NGL_CONFIG);

  HANDLE_UNSAVED_CHANGES = false;

  formGroupDirective = inject(FormGroupDirective);
  router = inject(Router);
  overlayService = inject(OverlayService);

  private routerSubscription?: Subscription;
  private isConfirming = false;

  constructor() {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {

      if (this.config.enableUnsavedChangesWarning && !this.HANDLE_UNSAVED_CHANGES) {
        return;
      }

      if (event instanceof NavigationStart && this.formGroupDirective.form?.dirty) {

        if (this.isConfirming) {
          return;
        }

        this.isConfirming = true;

        this.confirmUnsavedChanges().then((value) => {
          this.isConfirming = false;
          if (value) {
            this.formGroupDirective.resetForm();
            this.router.navigateByUrl(event.url);
          } else {
            this.router.navigateByUrl(this.router.url);
          }
        });

        this.router.navigateByUrl(this.router.url);
      }
    });
  }

  async confirmUnsavedChanges(): Promise<boolean> {
    const result = await this.overlayService.openAlert('Unsaved Changes', 'You have unsaved changes! Do you really want to leave?');
    return result;
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.config.enableUnsavedChangesWarning && !this.HANDLE_UNSAVED_CHANGES) {
      return;
    }

    if (this.formGroupDirective.form?.dirty) {
      $event.returnValue = 'You have unsaved changes! Do you really want to leave?';
    }
  }
}
