import {Component, inject} from '@angular/core';
import { LoaderService } from './loader-store';
import { SpinnerComponent } from '../spinner/spinner';
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    SpinnerComponent
  ],
  templateUrl: './loader.html',
})
export class LoaderComponent {

  loaderService = inject(LoaderService);
}
