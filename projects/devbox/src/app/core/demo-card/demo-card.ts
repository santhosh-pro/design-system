import { Component, EventEmitter, signal, input, computed, output } from '@angular/core';

export type DemoFile = {
  name: string;
  language: string;
  code: string;
};

export type DemoVariation = {
  label: string;
  description?: string;
};

export interface DocIO {
  title: string;
  desc: string;
  type: 'input' | 'output';
  expanded?: boolean;
}

@Component({
  selector: 'app-demo-card',
  standalone: true,
  templateUrl: './demo-card.html',
})
export class DemoCard {
  // Inputs as signals
  title = input<string>('Component Demo');
  description = input<string>('');
  files = input<DemoFile[]>([]);
  showCodeByDefault = input<boolean>(false);
  variations = input<DemoVariation[]>([]);
  docItems = input<DocIO[]>([]); // New input for DocIO items

  // Outputs
  variationChange = output<number>();

  // Signals
  selectedFileIndex = signal(0);
  showCode = signal(this.showCodeByDefault());
  selectedVariationIndex = signal(0);
  docItemsValues = signal<DocIO[]>([]); // Local writable copy for DocIO items
  copied = signal(false);

  // Computed
  activeFile = computed(() => this.files()[this.selectedFileIndex()] ?? null);

  ngOnInit() {
    this.showCode.set(this.showCodeByDefault());
    this.docItemsValues.set(this.docItems().map(item => ({ ...item, expanded: item.expanded ?? false }))); // Initialize local copy
  }

  ngOnChanges() {
    this.showCode.set(this.showCodeByDefault());
    this.docItemsValues.set(this.docItems().map(item => ({ ...item, expanded: item.expanded ?? false }))); // Update on input change
  }

  onSelectFile(i: number) {
    this.selectedFileIndex.set(i);
  }

  toggleCode() {
    this.showCode.update(v => !v);
  }

  toggleDocItem(index: number) {
    this.docItemsValues.update(items => {
      const newItems = [...items];
      newItems[index].expanded = !newItems[index].expanded;
      return newItems;
    });
  }

  async copyCode() {
    const text = this.activeFile()?.code ?? '';
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1200);
  }

  selectVariation(i: number) {
    this.selectedVariationIndex.set(i);
    this.variationChange.emit(i);
  }
}