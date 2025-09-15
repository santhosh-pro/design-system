import { Component, computed, inject, input, output, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { SideMenuItem } from "../side-nav-model";
import { CommonModule } from "@angular/common";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: "ui-side-nav-menu",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./side-nav-menu.html",
})
export class SideNavMenu {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Input signals
  menuItem = input.required<SideMenuItem>();
  isExpanded = input(true);

  // Output signals
  menuClick = output<SideMenuItem>();

  // Computed signals for styling
  isActive = computed(() => this.router.url === this.menuItem().link);

  menuItemClasses = computed(() => {
    const base = 'transition-all duration-300 ease-in-out';
    const active = this.isActive() 
      ? 'bg-gray-900 text-white shadow-lg scale-[1.02]' 
      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:scale-[1.01]';
    return `${base} ${active}`;
  });

  iconClasses = computed(() => {
    return this.isActive() 
      ? 'text-white' 
      : 'text-gray-500 group-hover:text-gray-700';
  });

  labelClasses = computed(() => {
    const visibility = this.isExpanded() 
      ? 'opacity-100 max-w-full' 
      : 'opacity-0 max-w-0 overflow-hidden';
    return `transition-all duration-300 ${visibility}`;
  });

  onMenuClick(menu: SideMenuItem) {
    if (menu.link) {
      this.router.navigate([menu.link]);
    } else if (menu.externalLink) {
      if (isPlatformBrowser(this.platformId)) {
        window.open(menu.externalLink, "_blank");
      }
    }
    this.menuClick.emit(menu);
  }
}