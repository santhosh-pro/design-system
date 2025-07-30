import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgClass],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  router = inject(Router);
  baseRoute = input<string>('/main');
  breadcrumbs: Breadcrumb[] = [];
  private subscription: Subscription | undefined;

  ngOnInit(): void {
    this.generateBreadcrumbs();
    this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private generateBreadcrumbs(): void {
    const url = this.router.url.split('?')[0]; 
    const urlSegments = url.split('/').filter((segment) => segment); 
    const base = this.baseRoute().replace(/^\//, ''); 

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let accumulatedPath = this.baseRoute();
    this.breadcrumbs = [
      {
        title: 'Home',
        route: this.baseRoute(),
        icon: `<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
                <path d="M0 0h24v24H0z" fill="none"/>
              </svg>`
      }
    ];

    this.breadcrumbs.push(
      ...urlSegments
        .filter((segment) => segment !== base && !uuidRegex.test(segment))
        .map((segment) => {
          accumulatedPath += `/${segment}`;
          return {
            title: this.formatSegment(segment),
            route: accumulatedPath
          };
        })
    );
  }

  private formatSegment(segment: string): string {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}

export interface Breadcrumb {
  title: string;
  route?: string;
  icon?: string;
}