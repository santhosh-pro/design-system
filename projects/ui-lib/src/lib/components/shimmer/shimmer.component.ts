import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-shimmer',
  standalone: true,
  imports: [],
  templateUrl: './shimmer.component.html',
  styleUrl: './shimmer.component.scss'
})
export class ShimmerComponent {
  type = input<'grid' | 'list' | 'single-line' | 'multiline'>('grid');
  count = input(1);
  loop = computed(() => {
    return Array(this.count()).fill(1).map((x, i) => i);
  });
}
