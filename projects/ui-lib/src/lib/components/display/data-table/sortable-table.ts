import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnInit,
  output,
  Renderer2,
  input,
  effect
} from '@angular/core';

@Directive({
  selector: '[sortableTable]',
  standalone: true
})
export class SortableTable implements OnInit, AfterViewInit {

  sortChange = output<TableSortEvent>();

  // New: accept externally controlled sort so we can render initial icon state
  sortKey = input<string | null>(null);
  sortDirection = input<'asc' | 'desc' | '' | null>(null);

  private currentKey: string = '';
  private currentDirection: 'asc' | 'desc' | '' = '';
  private viewInitialized = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // React to external sort changes (after headers exist, this will render icons)
    effect(() => {
      const key = this.sortKey();
      const dir = this.sortDirection();
      // Skip if nothing specified
      if (key == null && dir == null) return;
      // Apply only if changed from current
      const normalizedKey = key ?? '';
      const normalizedDir = (dir ?? '') as '' | 'asc' | 'desc';
      if (this.currentKey === normalizedKey && this.currentDirection === normalizedDir) return;
      this.currentKey = normalizedKey;
      this.currentDirection = normalizedDir;
      // Only try to render after view is initialized
      if (this.viewInitialized) {
        this.applyExternalSortIndicators();
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Find all <th> elements inside the table with data-sortable-key
    const thElements = this.el?.nativeElement?.querySelectorAll?.('th[data-sortable-key]');

    // Add click listeners to each <th>
    thElements?.forEach((th: HTMLElement) => {
      // this.renderer.addClass(th, 'flex');
      this.renderer.setStyle(th, 'cursor', 'pointer');

      // Add hover listener to show the default up arrow on hover
      this.renderer.listen(th, 'mouseenter', () => this.onMouseEnter(th));
      this.renderer.listen(th, 'mouseleave', () => this.onMouseLeave(th));

      // Add click listener for sorting
      this.renderer.listen(th, 'click', () => this.onHeaderClick(th));
    });

    // After headers are ready, apply any externally provided sort state
    this.applyExternalSortIndicators();
  }

  private applyExternalSortIndicators() {
    if (!this.viewInitialized || !this.el?.nativeElement) return;
    const thElements: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('th[data-sortable-key]');
    // Clear any existing icons first
    thElements?.forEach((header: HTMLElement) => {
      const icon = header.querySelector('.sort-icon');
      if (icon) icon.remove();
      const container = header.querySelector('.sort-icon-container');
      if (container) container.remove();
    });

    if (!this.currentKey || !this.currentDirection) {
      // Nothing to render
      return;
    }
    const target = Array.from(thElements || []).find(h => h.getAttribute('data-sortable-key') === this.currentKey) || null;
    if (!target) return;
    if (this.currentDirection === 'asc' || this.currentDirection === 'desc') {
      this.addSvgIcon(target, this.currentDirection);
    }
  }

  // Handle hover enter - show the up arrow
  onMouseEnter(th: HTMLElement) {
    const key = th.getAttribute('data-sortable-key');
    if (!key) return;
    // If no sorting is active, show the default up arrow on hover
    if ((!this.currentKey || this.currentKey !== key)) {
      this.addSvgIcon(th, 'asc', true); // Add default up arrow on hover
    }
  }

  // Handle hover leave - remove the hover arrow if it wasn't sorted
  onMouseLeave(th: HTMLElement) {
    const key = th.getAttribute('data-sortable-key');
    if (!key) return;

    if (this.currentDirection == '') {
      this.currentKey = '';
    }

    // If it's not the current sorted column, remove the hover icon
    if (!this.currentKey || this.currentKey !== key) {
      const iconContainer = th.querySelector('.sort-icon-container');
      if (iconContainer) {
        iconContainer.remove(); // Remove the hover arrow
      }
    }
  }

  onHeaderClick(th: HTMLElement) {
    const key = th.getAttribute('data-sortable-key');

    if (this.currentKey === key) {
      // Toggle direction if the same header is clicked
      this.currentDirection = this.currentDirection === 'asc' ? 'desc' : this.currentDirection === 'desc' ? '' : 'asc';
    } else {
      // Start with ascending order if a new header is clicked
      this.currentDirection = 'asc';
      this.currentKey = key!;
    }

    // Emit the sorting event
    let event: TableSortEvent = {key: this.currentKey, direction: this.currentDirection};
    this.sortChange.emit(event);

    // Update the sort indicators by injecting SVG icons
    this.updateSortIndicators(th);
  }

  updateSortIndicators(th: HTMLElement) {
    const thElements = this.el.nativeElement.querySelectorAll('th[data-sortable-key]');

    // Clear all existing sort indicators
    thElements.forEach((header: HTMLElement) => {
      const icon = header.querySelector('.sort-icon');
      if (icon) {
        icon.remove(); // Remove existing icon
      }
    });

    // Add the correct sort icon to the clicked header
    if (this.currentDirection === 'asc') {
      this.addSvgIcon(th, 'asc');
    } else if (this.currentDirection === 'desc') {
      this.addSvgIcon(th, 'desc');
    }
  }

  addSvgIcon(th: HTMLElement, direction: 'asc' | 'desc', isHover = false) {
    const existingIconContainer = th.querySelector('.sort-icon-container');
    if (existingIconContainer) {
      existingIconContainer.remove();
    }
    // Create a span to contain the icon
    const iconContainer = this.renderer.createElement('span');
    this.renderer.addClass(iconContainer, 'absolute');
    this.renderer.addClass(iconContainer, 'right-2');
    this.renderer.addClass(iconContainer, 'top-1/2');
    this.renderer.addClass(iconContainer, '-translate-y-1/2');
    this.renderer.addClass(iconContainer, 'sort-icon-container');
    this.renderer.addClass(iconContainer, 'inline-flex');
    this.renderer.addClass(iconContainer, 'align-sub');
    this.renderer.setStyle(iconContainer, 'margin-left', '0.25rem');
    // Create the SVG icon
    const svgIcon = this.renderer.createElement('svg', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(svgIcon, 'class', `sort-icon sort-${direction}`);
    this.renderer.setAttribute(svgIcon, 'width', '12');
    this.renderer.setAttribute(svgIcon, 'height', '12');
    this.renderer.setAttribute(svgIcon, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(svgIcon, 'fill', 'currentColor');
    // this.renderer.setAttribute(svgIcon, 'stroke', 'currentColor');

    let upArrow = 'M13 20H11V8.00003L5.49996 13.5L4.07996 12.08L12 4.16003L19.92 12.08L18.5 13.5L13 8.00003V20Z';
    let downArrow = 'M11.1115 4.30078H13.1115V16.3008L18.6115 10.8008L20.0315 12.2208L12.1115 20.1408L4.19153 12.2208L5.61153 10.8008L11.1115 16.3008V4.30078Z';
    const path = this.renderer.createElement('path', 'http://www.w3.org/2000/svg');
    const pathData = direction === 'asc' ? upArrow : downArrow;
    this.renderer.setAttribute(path, 'd', pathData);

    // Append the path to the SVG
    this.renderer.appendChild(svgIcon, path);

    // Append the SVG icon to the span
    this.renderer.appendChild(iconContainer, svgIcon);

    // Find the div with the class 'column-resizer'
    const resizerDiv = th.querySelector('.column-resizer');

    // Insert the icon container before the resizer div
    if (resizerDiv) {
      this.renderer.insertBefore(th, iconContainer, resizerDiv);
    } else {
      this.renderer.appendChild(th, iconContainer);
    }

    if (isHover) {
      this.renderer.setStyle(svgIcon, 'fill', 'grey');
    } else {
      this.renderer.setStyle(svgIcon, 'fill', 'black');
    }
  }
}

export interface TableSortEvent {
  key?: string | null;
  direction?: string | null;
}
