import { Component, computed, input, output, signal, HostListener, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from "@angular/common";
import { TopMenuItem } from "./top-nav-model";

@Component({
  selector: "ui-top-nav",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./top-nav.html",
})
export class TopNav {
  private platformId = inject(PLATFORM_ID);

  // Signals
  isExpanded = signal(false);
  isMobile = signal(false);

  // Input signals
  logoutMenu = input<TopMenuItem | null>(null);
  username = input<string>();

  // Output signals
  logoutClick = output<TopMenuItem>();

  constructor() {
    this.updateInitialState();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      const newMobile = window.innerWidth < 768;
      this.isMobile.set(newMobile);
      // Auto-close dropdown on mobile when resizing to desktop
      if (!newMobile) {
        this.isExpanded.set(false);
      }
    }
  }

  private updateInitialState() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 768);
      this.isExpanded.set(false); // Always collapsed on mobile initially
    } else {
      this.isMobile.set(false);
      this.isExpanded.set(false);
    }
  }

  // Computed signals for dynamic classes
  navClasses = computed(() => {
    return 'bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out';
  });

  toggleButtonLabel = computed(() =>
    this.isExpanded() ? 'Close Menu' : 'Open Menu'
  );

  toggleIconClass = computed(() =>
    this.isExpanded() ? 'rotate-90' : 'rotate-0'
  );

  dropdownClasses = computed(() => {
    const visibility = this.isExpanded() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none';
    return `absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 transition-all duration-300 ease-in-out ${visibility}`;
  });

  toggleDropdown() {
    this.isExpanded.update(expanded => !expanded);
  }

  onLogoutClick(menu: TopMenuItem) {
    this.logoutClick.emit(menu);
    if (this.isMobile()) {
      this.isExpanded.set(false);
    }
  }

  onDropdownClick(event: Event) {
    event.stopPropagation();
  }
}