import { Component, ElementRef, ViewContainerRef, inject, input, output, signal, computed, effect, Renderer2, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { viewChild } from '@angular/core';

@Component({
  selector: 'ui-base-overlay',
  templateUrl: './base-overlay.html',
  standalone: true,
})
export class BaseOverlayComponent implements AfterViewInit {
  title = input<string>();
  showTitle = input<boolean>(true);
  showBackButton = input<boolean>(false);

  backClick = output<void>();

  containerRef = viewChild.required<ViewContainerRef>('container');
  actionsRef = viewChild<ElementRef<HTMLDivElement>>('actions');
  actionsContainerRef = viewChild.required<ElementRef<HTMLDivElement>>('actionsContainer');
  closeButtonRef = viewChild<ElementRef<HTMLElement>>('closeButton');

  private renderer = inject(Renderer2);
  private dialogRef = inject(DialogRef);
  private cdr = inject(ChangeDetectorRef);
  private data = inject(DIALOG_DATA, { optional: true }) ?? {};

  private hasActions = signal<boolean>(false);

  isActionsContainerVisible = computed(() => this.hasActions());
  effectiveTitle = computed(() => this.title() ?? this.data?.title ?? '');

  constructor() {
    effect(() => {
      const actionsElement = this.actionsRef()?.nativeElement;
      if (actionsElement?.children.length) {
        this.hasActions.set(true);
      } else {
        this.hasActions.set(false);
        this.renderer.setStyle(this.actionsContainerRef().nativeElement, 'display', 'none');
      }
    });
  }

  ngAfterViewInit(): void {
    const closeBtnRef = this.closeButtonRef();
    if (closeBtnRef && closeBtnRef.nativeElement) {
      console.log('Focusing close button');
      this.renderer.selectRootElement(closeBtnRef.nativeElement).focus();
    }
  }

  protected onBackButtonClick(): void {
    console.log('Back button clicked');
    this.backClick.emit();
  }

  protected onCloseButtonClick(): void {
    console.log('Close button clicked');
    this.cdr.detectChanges();
    setTimeout(() => {
      console.log('Calling dialogRef.close()');
      this.dialogRef.close();
    }, 0);
  }
}