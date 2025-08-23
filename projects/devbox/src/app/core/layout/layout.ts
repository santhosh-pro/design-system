import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';


interface MenuItem {
  label: string;
  href?: string;
  subMenus?: MenuItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink,NgClass],
  templateUrl: './layout.html',
  styles: [],
})
export class Layout {
  @Input() menus: MenuItem[] = [];
  @Input() footerMessage: string = '';
  isSidebarOpen = false;


  openMenus: { [key: number]: boolean } = {};

  toggleSubMenu(index: number) {
    this.openMenus[index] = !this.openMenus[index];
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}