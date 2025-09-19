import { Component, computed, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SideMenuItem } from '../nav-model';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { AppSvgIcon } from '../../../misc/app-svg-icon/app-svg-icon';
import { filter } from 'rxjs';
import { TooltipDirective } from '../../../overlay/tooltip/tooltip.directive';
import { TooltipPosition, TooltipTheme } from '../../../overlay/tooltip/tooltip.enums';

@Component({
  selector: 'ui-side-nav-menu',
  standalone: true,
  imports: [CommonModule, AppSvgIcon, TooltipDirective],
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

  // Internal signal to force reactivity
  private routeChangeSignal = signal(0);

    TooltipPosition = TooltipPosition;
      TooltipTheme = TooltipTheme;



  constructor() {
    // Listen to navigation events and update the signal
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Update the signal to trigger computed recalculation
        this.routeChangeSignal.update(count => count + 1);
      });
  }

  // Computed signals for styling
  isActive = computed(() => {
    // Access the route change signal to make this reactive
    this.routeChangeSignal();
    return this.isActiveRoute(this.menuItem().link);
  });

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
    const textColor = this.isActive() ? 'text-primary-600' : 'text-gray-700';
    return `transition-all duration-300 ${visibility} ${textColor}`;
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
      paths: 'subset', // Use 'subset' to match child routes
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}