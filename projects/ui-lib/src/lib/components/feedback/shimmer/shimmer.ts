import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'ui-shimmer',
  standalone: true,
  imports: [],
  templateUrl: './shimmer.html',
})
export class ShimmerComponent {
  type = input<'grid' | 'list' | 'single-line' | 'multiline'>('grid');
  count = input(1);
  loop = computed(() => {
    return Array(this.count()).fill(1).map((x, i) => i);
  });
}
