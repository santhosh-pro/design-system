import {AfterViewInit, Directive, ElementRef, inject, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appTableResizableColumns]',
  standalone: true
})
export class TableResizableColumnsDirective implements AfterViewInit {

  el = inject(ElementRef);
  renderer = inject(Renderer2);

  @Input('appTableResizableColumns') applyResizableColumn!: boolean;

  constructor() {

  }

  ngAfterViewInit(): void {
    if (!this.applyResizableColumn) {
      return;
    }
    this.applyDirectiveLogic();
  }

  applyDirectiveLogic() {
    const thElements = this.el.nativeElement.querySelectorAll('thead tr th');

    thElements.forEach((thElement: HTMLElement) => {
      // Set necessary styles on each th element
      this.renderer.setStyle(thElement, 'position', 'relative');
      this.renderer.setStyle(thElement, 'white-space', 'nowrap');

      // Create the div with the necessary classes
      const resizeDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(resizeDiv, 'class', 'column-resizer absolute flex justify-center top-1/2 -translate-y-1/2 right-0 bottom-0 w-[8px] h-[80%] cursor-col-resize z-10');

      // Create the span with the necessary Tailwind CSS classes
      const resizeHandle = this.renderer.createElement('span');
      this.renderer.setAttribute(resizeHandle, 'class', 'bg-gray-100 w-[1px] h-full block');

      // Append the span to the div
      this.renderer.appendChild(resizeDiv, resizeHandle);

      // Append the div to the th element
      this.renderer.appendChild(thElement, resizeDiv);

      // Add the resize functionality to each th element
      this.addResizeFunctionality(thElement, resizeDiv);
    });
  }

  addResizeFunctionality(thElement: HTMLElement, resizeDiv: HTMLElement) {
    let startX: number;
    let startWidth: number;

    const startResize = (event: MouseEvent) => {
      event.preventDefault();  // Prevent text selection
      startX = event.pageX;
      startWidth = thElement.offsetWidth;

      // Bind event listeners for mousemove and mouseup
      document.addEventListener('mousemove', resizeColumn);
      document.addEventListener('mouseup', stopResize);
    };

    const resizeColumn = (event: MouseEvent) => {
      const diffX = event.pageX - startX;
      const newWidth = startWidth + diffX;
      this.renderer.setStyle(thElement, 'width', `${newWidth}px`);
    };

    const stopResize = () => {
      // Remove the event listeners once resizing is complete
      document.removeEventListener('mousemove', resizeColumn);
      document.removeEventListener('mouseup', stopResize);
    };

    // Add mousedown listener to the resize handle (div)
    this.renderer.listen(resizeDiv, 'mousedown', startResize);
  }

}
