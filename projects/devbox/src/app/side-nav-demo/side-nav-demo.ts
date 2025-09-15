import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuItem, SideNav, TopMenuItem, TopNav } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-side-nav-demo',
  imports: [SideNav, TopNav, RouterOutlet],
  templateUrl: './side-nav-demo.html',
  styleUrl: './side-nav-demo.css'
})
export class SideNavDemo {
  menus = signal<SideMenuItem[]>([
    {
      id: 'ffff',
      isSeparator: true,
      isEnabled: true,
      groupHeading: 'Overview'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      link: '/dashboard',
      isEnabled: true
    },
    {
      id: 'users',
      label: 'Users Management',
      link: '/users',
      isEnabled: true
    },
    {
      id: 'separator1',
      isSeparator: true,
      isEnabled: true,
      groupHeading: 'Reports'
    },
    {
      id: 'reports',
      label: 'Reports',
      isEnabled: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      link: '/analytics',
      isEnabled: true
    }
  ]);

  settingsMenu = signal<SideMenuItem>({
    id: 'settings',
    label: 'Settings',
    link: '/settings',
    isEnabled: true,
  });

  logoutMenu = signal<TopMenuItem>({
    id: 'logout',
    label: 'Logout',
    iconPath: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',

    isEnabled: true,
  });

  handleLogoutClick(menu: SideMenuItem) {
    console.log('Logout clicked:', menu.label);
    // Implement logout logic here (e.g., auth service logout)
  }

  handleMenuClick(menu: SideMenuItem) {
    console.log('Menu clicked:', menu.label);
    // Implement navigation or other logic here
  }
}
