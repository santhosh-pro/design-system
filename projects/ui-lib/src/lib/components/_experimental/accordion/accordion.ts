import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, input, output, signal, viewChild, viewChildren } from '@angular/core';
import { AccordionSection } from './accordion-model';

@Component({
  selector: 'ui-accordion',
  imports: [CommonModule],
  templateUrl: './accordion.html',
})
export class Accordion {
// Input signal for sections configuration
  sections = input<AccordionSection[]>([], { alias: 'sectionsConfig' });

  // Input signal to enable/disable multiple open sections
  allowMultiple = input<boolean>(false, { alias: 'allowMultiple' });

  // Input signal to enable/disable scroll to content
  scrollToContent = input<boolean>(true, { alias: 'scrollToContent' });

  // Output events for section toggle, addition, and removal
  sectionToggle = output<string>();
  sectionAdded = output<AccordionSection>();
  sectionRemoved = output<string>();

  // ViewChildren to access all section content containers
  sectionContents = viewChildren<ElementRef<HTMLElement>>('sectionContent');

  // Local writable signal to manage sections internally
  internalSections = signal<AccordionSection[]>([]);

  // Signal for active section IDs
  private activeSectionIdsSignal = signal<string[]>([]);

  // Computed signal for active section IDs
  activeSectionIds = computed(() => this.activeSectionIdsSignal());

  constructor() {
    // Effect to sync internalSections with input sections
    effect(() => {
      const inputSections = this.sections();
      this.internalSections.set(inputSections);
      // Clear active sections if they no longer exist
      this.activeSectionIdsSignal.update(current =>
        current.filter(id => inputSections.some(section => section.id === id))
      );
    });
  }

  // Method to toggle a section
  toggleSection(sectionId: string): void {
    if (this.internalSections().find(section => section.id === sectionId)?.disabled) {
      return;
    }

    this.activeSectionIdsSignal.update(current => {
      if (current.includes(sectionId)) {
        // Collapse section
        return current.filter(id => id !== sectionId);
      } else {
        // Expand section
        if (this.allowMultiple()) {
          return [...current, sectionId];
        } else {
          return [sectionId];
        }
      }
    });

    this.sectionToggle.emit(sectionId);

    // Scroll to section if enabled
    if (this.scrollToContent()) {
      const containers = this.sectionContents();
      const container = containers.find(el => {
        const parentSection = el.nativeElement.closest('.border-b');
        return parentSection?.querySelector('button')?.textContent?.trim() === sectionId;
      });
      if (container) {
        container.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Method to add a new section dynamically
  addSection(section: AccordionSection): void {
    this.sectionAdded.emit(section);
    const currentSections = this.internalSections().slice();
    currentSections.push(section);
    this.internalSections.set(currentSections);
    if (!this.allowMultiple()) {
      this.activeSectionIdsSignal.set([section.id]);
    } else {
      this.activeSectionIdsSignal.update(current => [...current, section.id]);
    }
  }

  // Method to remove a section
  removeSection(sectionId: string): void {
    this.sectionRemoved.emit(sectionId);
    const currentSections = this.internalSections().slice();
    const index = currentSections.findIndex(section => section.id === sectionId);
    if (index !== -1) {
      currentSections.splice(index, 1);
      this.internalSections.set(currentSections);
      this.activeSectionIdsSignal.update(current => current.filter(id => id !== sectionId));
    }
  }
}
