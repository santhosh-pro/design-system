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
      this.isMobile.set(window.innerWidth < 768);
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
    const width = this.isExpanded() ? 'w-64 sm:w-72 md:w-80' : 'w-20';
    return `${width} transition-all duration-300 ease-in-out`;
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