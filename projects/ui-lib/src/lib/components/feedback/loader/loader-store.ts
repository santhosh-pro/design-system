import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderStore {

  loadingCount = signal(0);

  show() {
    this.loadingCount.update((current) => current + 1);
  }

  hide() {
    this.loadingCount.update((current) => current - 1);
  }

}
