import {Injectable, signal} from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loadingCount = signal(0);

  show() {
    this.loadingCount.update((current) => current + 1);
  }

  hide() {
    this.loadingCount.update((current) => current - 1);
  }

}
