import { Component, computed, input, output, signal, viewChild, HostListener, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { SideMenuItem } from "./side-nav-model";
import { CommonModule } from "@angular/common";
import { SideNavMenu } from "./side-nav-menu/side-nav-menu";
import { TopNav } from "./top-nav/top-nav";
import { TopMenuItem } from "./top-nav/top-nav-model";

@Component({
  selector: "ui-side-nav",
  standalone: true,
  imports: [CommonModule, SideNavMenu, TopNav],
  templateUrl: "./side-nav.html",
})
export class SideNav {
  private platformId = inject(PLATFORM_ID);

  // Signals
  isExpanded = signal(true);
  isMobile = signal(false);

  // Input signals
  settingsMenu = input<SideMenuItem | null>(null);
  menus = input<SideMenuItem[]>([]);
  logoutMenu = input<TopMenuItem | null>(null);
  username = input<string>();

  // Output signals
  menuClick = output<SideMenuItem>();

  // ViewChild for settings menu
  settingsMenuComponent = viewChild<SideNavMenu>("settingsMenuRef");

  constructor() {
    this.updateInitialState();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      const newMobile = window.innerWidth < 768;
      const wasMobile = this.isMobile();
      this.isMobile.set(newMobile);
      if (newMobile !== wasMobile) {
        this.isExpanded.set(!newMobile);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isMobile() && this.isExpanded()) {
      const sidebar = (event.target as HTMLElement).closest('nav');
      if (!sidebar) {
        this.toggleSidebar();
      }
    }
  }

  private updateInitialState() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 768);
      this.isExpanded.set(!this.isMobile());
    } else {
      this.isMobile.set(false);
      this.isExpanded.set(true);
    }
  }

  // Computed signals for dynamic classes
  sidebarClasses = computed(() => {
    let positionClass = 'fixed top-14 left-0 bottom-0 z-40';
    let widthClass = '';
    if (this.isMobile() && this.isExpanded()) {
      // Overlay mode on mobile
      positionClass = 'fixed top-14 left-0 bottom-0 w-full z-50 shadow-xl';
      widthClass = 'w-full bg-white';
    } else {
      // Standard mode
      widthClass = this.isExpanded() ? 'w-64 sm:w-72 md:w-80' : 'w-20';
      positionClass += ` ${widthClass}`;
    }
    return `${positionClass} border-r border-gray-200 bg-white transition-all duration-300 ease-in-out`;
  });

  mainContentClasses = computed(() => {
    if (this.isMobile() && this.isExpanded()) {
      return 'ml-0';
    } else if (this.isExpanded()) {
      return 'ml-64 sm:ml-72 md:ml-80';
    } else {
      return 'ml-20';
    }
  });

  toggleButtonLabel = computed(() =>
    this.isExpanded() ? 'Collapse Sidebar' : 'Expand Sidebar'
  );

  toggleIconClass = computed(() =>
    this.isExpanded() ? 'rotate-0' : 'rotate-180'
  );

  toggleSidebar() {
    this.isExpanded.update(expanded => !expanded);
  }

  onMenuClick(menu: SideMenuItem) {
    this.menuClick.emit(menu);
    if (this.isMobile()) {
      this.isExpanded.set(false);
    }
  }

  onSidebarClick(event: Event) {
    event.stopPropagation();
  }

  focusSettingsMenu() {
    const settingsMenu = this.settingsMenuComponent();
    if (settingsMenu) {
      settingsMenu.onMenuClick(settingsMenu.menuItem());
    }
  }

  onLogoutClick(e: TopMenuItem) {
    console.log('Logout clicked', e);
  }
}