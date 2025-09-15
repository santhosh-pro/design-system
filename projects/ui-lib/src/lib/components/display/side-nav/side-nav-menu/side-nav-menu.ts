import { Component, computed, inject, input, output, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { SideMenuItem } from '../side-nav-model';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { AppSvgIcon } from '../../../../components/misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-side-nav-menu',
  standalone: true,
  imports: [CommonModule, AppSvgIcon],
  templateUrl: './side-nav-menu.html',
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
  isActive = computed(() => this.isActiveRoute(this.menuItem().link));

  menuItemClasses = computed(() => {
    const base = 'transition-all duration-300 ease-in-out';
    const active = this.isActive()
      ? 'bg-primary-100 text-primary-600 shadow-lg scale-[1.02]'
      : 'text-gray-700 hover:text-primary-500 hover:bg-primary-50 hover:scale-[1.01]';
    return `${base} ${active}`;
  });

  iconClasses = computed(() => {
    return this.isActive()
      ? 'text-primary-600'
      : 'text-gray-500 group-hover:text-primary-500';
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
        window.open(menu.externalLink, '_blank');
      }
    }
    this.menuClick.emit(menu);
  }

  isActiveRoute(link: string | undefined): boolean {
    if (!link) return false;
    return this.router.isActive(link, {
      paths: 'exact', // Match the base path exactly
      queryParams: 'ignored', // Ignore query parameters
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}