import {
  Component,
  ComponentRef, input,
  Input,
  OnChanges, OnDestroy, output, OutputEmitterRef, OutputRefSubscription,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TableActionEvent } from '../../display/data-table/data-table';

@Component({
  standalone: true,
  selector: 'app-dynamic-renderer',
  templateUrl: './dynamic-renderer.component.html',
  styleUrl: './dynamic-renderer.component.scss'
})
export class DynamicRendererComponent<T> implements OnChanges, OnDestroy {
  @Input() component!: Type<any>;
  @Input() rowData!: T;
  data = input<any>();
  rowPosition = input<number | undefined>();
  isLastRow = input<boolean>(false);

  actionPerformed = output<TableActionEvent>();

  @ViewChild('container', {read: ViewContainerRef, static: true})
  container!: ViewContainerRef;

  private componentRef?: ComponentRef<any>;
  private actionSubscription?: OutputRefSubscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['component'] || changes['rowData'] || changes['data'] || changes['rowPosition'] || changes['isLastRow']) {
      this.loadComponent();
    }
  }

  private loadComponent(): void {
    if (!this.component) {
      return;
    }

    this.container.clear();

    this.componentRef = this.container.createComponent(this.component);


    if (this.componentRef.instance) {
      (this.componentRef.instance as any).rowData = this.rowData;
      (this.componentRef.instance as any).data = this.data();
      (this.componentRef.instance as any).rowPosition = this.rowPosition();
      (this.componentRef.instance as any).isLastRow = this.isLastRow();

      this.actionSubscription?.unsubscribe();

      let emitter: OutputEmitterRef<any> = this.componentRef.instance.actionPerformed;
      if (emitter) {
        this.actionSubscription = emitter.subscribe(
          (event: any) => {
            this.actionPerformed.emit(event);
          }
        );
      }

    }
  }

  ngOnDestroy(): void {
    this.actionSubscription?.unsubscribe();
  }
}
