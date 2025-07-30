import {inject, Injectable} from '@angular/core';
import {NGL_CONFIG} from './ngl-config.token';

@Injectable({
  providedIn: 'root'
})
export class NglService {

  private config = inject(NGL_CONFIG);

  constructor() {
  }

  getBaseUrl() {
    return this.config.baseApiUrl;
  }
}
