import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Layout } from './core/layout/layout';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Layout
],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('devbox');

footerMessage = '© 2025 My App. All rights reserved.';

 menus = [
  {
    label: 'Feedback / Status',
    subMenus: [
      { label: 'Loader', href: '#/components/feedback/loader' },
      { label: 'No Data', href: '#/components/feedback/no-data' },
      { label: 'Shimmer', href: '#/components/feedback/shimmer' },
      { label: 'Spinner', href: '#/components/feedback/spinner' },
      { label: 'Status Badge', href: '#/components/feedback/status-badge' },
    ],
  },
  {
    label: 'Overlay / Dialog',
    subMenus: [
      { label: 'Overlay', href: '#/components/overlay/overlay' },
      { label: 'Context Menu Button', href: '#/components/overlay/context-menu-button' },
      { label: 'Context Menu Icon', href: '#/components/overlay/context-menu-icon' },
    ],
  },
  {
    label: 'Forms',
    subMenus: [
      { label: 'Button', href: '#/components/forms/button' },
      { label: 'Checkbox', href: '#/components/forms/checkbox' },
      { label: 'Input Mask', href: '#/components/forms/input-mask' },
      { label: 'Multi-Select Dropdown', href: 'mul-select' },
      { label: 'Single Selection Field', href: 'single-select' },
      { label: 'Text Input', href: '#/components/forms/text-input' },
      {
        label: 'Date',
        subMenus: [
          { label: 'Date Input', href: '#/components/forms/date/date-input' },
          { label: 'Date Picker', href: '#/components/forms/date/date-picker' },
          { label: 'Date Range Picker', href: 'date-range-picker' },
          { label: 'Multi-Date Picker', href: '#/components/forms/date/multi-date-picker' },
        ],
      },
    ],
  },
  {
    label: 'Data Display',
    subMenus: [
      { label: 'Data Table', href: 'data-table' },
      { label: 'Pagination', href: '#/components/display/pagination' },
    ],
  },
  {
    label: 'Misc / Utility',
    subMenus: [
      { label: 'App Svg Icon', href: '#/components/misc/app-svg-icon' },
      { label: 'Breadcrumb', href: '#/components/misc/breadcrumb' },
      { label: 'Dynamic Renderer', href: '#/components/misc/dynamic-renderer' },
      { label: 'Toast', href: '#/components/misc/toast' },
      { label: 'Unsaved Aware', href: '#/components/misc/unsaved-aware' },
    ],
  },
];

}
