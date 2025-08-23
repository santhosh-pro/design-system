import { Component, input, OnInit, signal } from '@angular/core';

export interface DocIO {
  title: string;
  desc: string;
  type: 'input' | 'output';
    expanded?: boolean;

}

@Component({
  selector: 'app-doc-io-list',
  imports: [],
  templateUrl: './doc-io-list.html',
})
export class DocIoList implements OnInit {
  items = input<DocIO[]>([]); // parent passes in

  // local writable copy
  values = signal<DocIO[]>([]);

  ngOnInit() {
    this.values.set(this.items()); // initialize local copy
  }

  toggle(item: DocIO) {
    item.expanded = !item.expanded;
    this.values.set([...this.values()]); // trigger reactivity
  }
}
