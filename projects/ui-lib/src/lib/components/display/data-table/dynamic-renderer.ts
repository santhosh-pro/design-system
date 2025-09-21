import {
  Component,
  ComponentRef,
  input,
  Input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TableActionEvent } from './desktop-data-table/desktop-data-table';

@Component({
  standalone: true,
  selector: 'ui-dynamic-renderer',
  template: '<ng-container #container></ng-container>',
})
export class DynamicRenderer<T> implements OnChanges, OnDestroy {
  @Input() component!: Type<any>;
  @Input() rowData!: T;
  data = input<any>();
  rowPosition = input<number | undefined>();
  isLastRow = input<boolean>(false);

  actionPerformed = output<TableActionEvent>();

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private actionSubscription?: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component'] || changes['rowData'] || changes['data'] || changes['rowPosition'] || changes['isLastRow']) {
      this.loadComponent();
    }
  }

  private loadComponent(): void {
    if (!this.component) {
      console.warn('No component provided to DynamicRendererComponent');
      this.container.clear();
      return;
    }

    try {
      this.container.clear();
      this.componentRef = this.container.createComponent(this.component);

      if (this.componentRef.instance) {
        // Assign inputs
        this.componentRef.instance.rowData = this.rowData;
        this.componentRef.instance.data = this.data();
        this.componentRef.instance.rowPosition = this.rowPosition();
        this.componentRef.instance.isLastRow = this.isLastRow();

        // Clean up previous subscription
        this.actionSubscription?.unsubscribe();

        // Subscribe to actionPerformed if it exists
        if (this.componentRef.instance.actionPerformed) {
          this.actionSubscription = this.componentRef.instance.actionPerformed.subscribe(
            (event: TableActionEvent) => {
              this.actionPerformed.emit(event);
            }
          );
        }
      }
    } catch (error) {
      console.error('Error creating component:', error);
    }
  }

  ngOnDestroy(): void {
    this.actionSubscription?.unsubscribe();
    this.container.clear();
  }
}