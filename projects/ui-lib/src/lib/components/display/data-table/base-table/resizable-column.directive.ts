import {AfterViewInit, Directive, ElementRef, inject, Renderer2} from '@angular/core';

@Directive({
  selector: '[appResizableColumn]',
  standalone: true
})
export class ResizableColumnDirective implements AfterViewInit {
  private startX!: number;
  private startWidth!: number;
  private resizeColumnHandler: any;
  private stopResizeHandler: any;

  el = inject(ElementRef);
  renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    // Set necessary styles on the th element
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'white-space', 'nowrap');

    // Create the div with class p-[2px]
    const resizeDiv = this.renderer.createElement('div');
    this.renderer.setAttribute(resizeDiv, 'class', 'column-resizer absolute flex justify-center top-1/2 -translate-y-1/2 right-0 bottom-0 w-[8px] h-[80%] cursor-col-resize z-10');

    // Create the span with the Tailwind CSS classes
    const resizeHandle = this.renderer.createElement('span');
    this.renderer.setAttribute(resizeHandle, 'class', 'bg-gray-100 w-[1px] h-full block');

    // Append the span to the div
    this.renderer.appendChild(resizeDiv, resizeHandle);

    // Append the div to the th element
    this.renderer.appendChild(this.el.nativeElement, resizeDiv);

    // Add mousedown listener to the resize handle
    this.renderer.listen(resizeDiv, 'mousedown', this.startResize.bind(this));
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.startX = event.pageX;
    this.startWidth = this.el.nativeElement.offsetWidth;

    // Bind event listeners for mousemove and mouseup
    this.resizeColumnHandler = this.resizeColumn.bind(this);
    this.stopResizeHandler = this.stopResize.bind(this);
    document.addEventListener('mousemove', this.resizeColumnHandler);
    document.addEventListener('mouseup', this.stopResizeHandler);
  }

  resizeColumn(event: MouseEvent) {
    const diffX = event.pageX - this.startX;
    const newWidth = this.startWidth + diffX;
    this.renderer.setStyle(this.el.nativeElement, 'width', `${newWidth}px`);
  }

  stopResize() {
    // Remove the event listeners once the resize is done
    document.removeEventListener('mousemove', this.resizeColumnHandler);
    document.removeEventListener('mouseup', this.stopResizeHandler);
  }
}
