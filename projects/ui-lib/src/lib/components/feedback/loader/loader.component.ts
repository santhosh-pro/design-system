import {Component, inject} from '@angular/core';
import {LoaderService} from "./loader.service";
import {SpinnerComponent} from "../spinner/spinner.component";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    SpinnerComponent
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {

  loaderService = inject(LoaderService);
}
