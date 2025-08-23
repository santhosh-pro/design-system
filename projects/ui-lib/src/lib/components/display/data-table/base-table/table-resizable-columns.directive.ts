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
    const table = this.el.nativeElement;
    const thElements = table.querySelectorAll('thead tr th');
    const isRtl = window.getComputedStyle(table).direction === 'rtl';

    // Set initial explicit widths on th to preserve layout before applying table-layout: fixed
    thElements.forEach((thElement: HTMLElement) => {
      const currentWidth = thElement.offsetWidth;
      this.renderer.setStyle(thElement, 'width', `${currentWidth}px`);
    });

    // Apply table-layout: fixed to make column resizing independent
    this.renderer.setStyle(table, 'table-layout', 'fixed');

    // Find the scrollable container if any
    let scrollContainer: HTMLElement | null = table.parentElement;
    while (scrollContainer && !['auto', 'scroll'].includes(window.getComputedStyle(scrollContainer).overflowX)) {
      scrollContainer = scrollContainer.parentElement;
    }
    if (!scrollContainer || scrollContainer === document.body) {
      scrollContainer = null;
    }

    thElements.forEach((thElement: HTMLElement) => {
      // Set necessary styles on each th element
      this.renderer.setStyle(thElement, 'position', 'relative');
      this.renderer.setStyle(thElement, 'white-space', 'nowrap');

      // Create the div with the necessary classes, adjusting position for RTL
      const resizeDiv = this.renderer.createElement('div');
      const positionClass = isRtl ? 'left-0' : 'right-0';
      this.renderer.setAttribute(resizeDiv, 'class', `column-resizer absolute flex justify-center top-1/2 -translate-y-1/2 ${positionClass} bottom-0 w-[8px] h-[80%] cursor-col-resize z-10`);

      // Create the span with the necessary Tailwind CSS classes
      const resizeHandle = this.renderer.createElement('span');
      this.renderer.setAttribute(resizeHandle, 'class', 'bg-gray-100 w-[1px] h-full block');

      // Append the span to the div
      this.renderer.appendChild(resizeDiv, resizeHandle);

      // Append the div to the th element
      this.renderer.appendChild(thElement, resizeDiv);

      // Add the resize functionality to each th element
      this.addResizeFunctionality(thElement, resizeDiv, isRtl, scrollContainer);
    });
  }

  addResizeFunctionality(thElement: HTMLElement, resizeDiv: HTMLElement, isRtl: boolean, scrollContainer: HTMLElement | null) {
    let startX: number;
    let startWidth: number;
    let lastPageX: number;
    let autoScrollInterval: any;
    const minWidth = 20; // Minimum column width in pixels
    const resizeSign = isRtl ? -1 : 1;

    const getPageX = (event: Event): number => {
      if (event instanceof TouchEvent) {
        return event.touches[0]?.pageX ?? event.changedTouches[0]?.pageX;
      }
      return (event as MouseEvent).pageX;
    };

    const startResize = (event: Event) => {
      event.preventDefault(); // Prevent text selection or scrolling
      startX = getPageX(event);
      lastPageX = startX;
      startWidth = thElement.offsetWidth;

      // Add event listeners for move and stop
      document.addEventListener('mousemove', resizeColumn);
      document.addEventListener('mouseup', stopResize);
      document.addEventListener('touchmove', resizeColumn, { passive: false });
      document.addEventListener('touchend', stopResize);
      document.addEventListener('touchcancel', stopResize);

      // Start auto-scroll interval if there's a scrollable container
      if (scrollContainer) {
        autoScrollInterval = setInterval(autoScroll, 16); // ~60fps
      }
    };

    const resizeColumn = (event: Event) => {
      event.preventDefault(); // Prevent scrolling on touch
      lastPageX = getPageX(event);
      updateWidth();
    };

    const updateWidth = () => {
      const diffX = (lastPageX - startX) * resizeSign;
      const newWidth = Math.max(startWidth + diffX, minWidth);
      this.renderer.setStyle(thElement, 'width', `${newWidth}px`);
    };

    const autoScroll = () => {
      if (!scrollContainer) return;
      const rect = scrollContainer.getBoundingClientRect();
      const buffer = 50;
      let speed = 0;

      // Adjust for RTL if necessary (reverse edges for scrolling direction)
      const leftEdge = isRtl ? rect.right - buffer : rect.left + buffer;
      const rightEdge = isRtl ? rect.left + buffer : rect.right - buffer;
      const isNearStart = isRtl ? lastPageX > leftEdge : lastPageX < leftEdge;
      const isNearEnd = isRtl ? lastPageX < rightEdge : lastPageX > rightEdge;

      if (isNearEnd) {
        speed = isRtl ? (leftEdge - lastPageX) / buffer * 30 : (lastPageX - rightEdge) / buffer * 30;
      } else if (isNearStart) {
        speed = isRtl ? (lastPageX - rightEdge) / buffer * 30 : (leftEdge - lastPageX) / buffer * 30;
      } else {
        return;
      }

      speed = Math.max(speed, 0);
      const scrollDirection = (isRtl ? -1 : 1) * (isNearEnd ? 1 : -1);
      const oldScrollLeft = scrollContainer.scrollLeft;
      scrollContainer.scrollLeft += speed * scrollDirection;
      const actualScrolled = scrollContainer.scrollLeft - oldScrollLeft;

      // Adjust startX based on scroll to simulate continued resizing
      startX -= actualScrolled * resizeSign;
      updateWidth();
    };

    const stopResize = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
      document.removeEventListener('mousemove', resizeColumn);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchmove', resizeColumn);
      document.removeEventListener('touchend', stopResize);
      document.removeEventListener('touchcancel', stopResize);
    };

    // Add listeners for mousedown and touchstart
    this.renderer.listen(resizeDiv, 'mousedown', startResize);
    this.renderer.listen(resizeDiv, 'touchstart', startResize, { passive: false });
  }

}