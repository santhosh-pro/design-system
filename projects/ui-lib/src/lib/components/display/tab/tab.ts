import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { TabModel } from './tab-model';

@Component({
  selector: 'ui-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.html',
})
export class Tab {
  // Input signal for tabs configuration
  tabs = input<TabModel[]>([], { alias: 'tabsConfig' });

  // Input signal to enable/disable scroll to content
  scrollToContent = input<boolean>(false, { alias: 'scrollToContent' });

  // Output events for tab changes, additions, and removals
  tabChange = output<string>();
  tabAdded = output<TabModel>();
  tabRemoved = output<string>();

  // ViewChild to access content container
  contentContainer = viewChild.required<ElementRef<HTMLElement>>('contentContainer');

  // Local writable signal to manage tabs internally
  private internalTabs = signal<TabModel[]>([]);

  // Signal for active tab
  private activeTabIdSignal = signal<string>('');

  // Computed signal for active tab ID
  activeTabId = computed(() => this.activeTabIdSignal());

  // Computed signal for active tab content
  activeTabContent = computed(() => {
    const activeTab = this.internalTabs().find(tab => tab.id === this.activeTabId());
    return activeTab?.content || '';
  });

  constructor() {
    // Effect to sync internalTabs with input tabs
    effect(() => {
      const inputTabs = this.tabs();
      this.internalTabs.set(inputTabs);
      if (inputTabs.length > 0 && !this.activeTabId()) {
        this.activeTabIdSignal.set(inputTabs[0].id);
      }
    });
  }

  // Method to select a tab
  selectTab(tabId: string): void {
    if (this.internalTabs().find(tab => tab.id === tabId)?.disabled) {
      return;
    }

    this.activeTabIdSignal.set(tabId);
    this.tabChange.emit(tabId);

    // Scroll to content if enabled
    if (this.scrollToContent()) {
      const container = this.contentContainer()?.nativeElement;
      if (container) {
        container.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Method to add a new tab dynamically
  addTab(tab: TabModel): void {
    this.tabAdded.emit(tab);
    const currentTabs = this.internalTabs().slice();
    currentTabs.push(tab);
    this.internalTabs.set(currentTabs);
    this.activeTabIdSignal.set(tab.id);
  }

  // Method to remove a tab
  removeTab(tabId: string): void {
    this.tabRemoved.emit(tabId);
    const currentTabs = this.internalTabs().slice();
    const index = currentTabs.findIndex(tab => tab.id === tabId);
    if (index !== -1) {
      currentTabs.splice(index, 1);
      this.internalTabs.set(currentTabs);
      if (this.activeTabId() === tabId) {
        this.activeTabIdSignal.set(currentTabs[0]?.id || '');
      }
    }
  }
}