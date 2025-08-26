import {DialogRef} from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input, output,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'app-base-overlay',
  imports: [],
  templateUrl: './base-overlay.html',
  standalone: true,
  styleUrl: './base-overlay.css'
})
export class BaseOverlayComponent implements AfterViewInit {

  @ViewChild('container', {read: ViewContainerRef, static: true}) container!: ViewContainerRef;
  @ViewChild('actions', {static: false}) actionsDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('actionsContainer', {static: false}) actionsContainerDiv!: ElementRef<HTMLDivElement>;

  title = input.required<String>();
  showTitle = input(true);
  showBackButton = input(false);


  onBackClicked = output<void>();

  renderer = inject(Renderer2);
  dialogRef = inject(DialogRef<any>);


  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.actionsDiv) {
      const children = this.actionsDiv.nativeElement.children;
      if (children.length === 0) {
        this.renderer.setStyle(this.actionsContainerDiv.nativeElement, 'display', 'none');
      }
    }
  }

  goBack() {
    this.onBackClicked.emit();
  }

  onCloseClicked() {
    this.dialogRef.close();
  }
}
