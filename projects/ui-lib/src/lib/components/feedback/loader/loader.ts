import {Component, inject} from '@angular/core';
import { LoaderStore } from './loader-store';
import { Spinner as Spinner } from '../spinner/spinner';
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    Spinner
  ],
  templateUrl: './loader.html',
})
export class Loader {

  loaderService = inject(LoaderStore);
}
