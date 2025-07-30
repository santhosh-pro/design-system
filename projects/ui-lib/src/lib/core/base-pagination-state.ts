import {signal} from "@angular/core";
import {RequestState} from './base-state';

export class PaginationState<T> {
  responseSignal = signal<T | null>(null);
  private loadingSignal = signal<boolean>(false);
  private successSignal = signal<boolean>(false);
  private failedSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private stateSignal = signal<RequestState | null>(null);

  readonly response = this.responseSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly success = this.successSignal.asReadonly();
  readonly failed = this.failedSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly state = this.stateSignal.asReadonly();

  items = signal<any[]>([]);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(1);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(0);

  constructor() {
    this.stateSignal.set(RequestState.idle);
  }

  notifyLoading() {
    this.loadingSignal.set(true);
    this.responseSignal.set(null);
    this.successSignal.set(false);
    this.failedSignal.set(false);
    this.errorSignal.set(null);
    this.stateSignal.set(RequestState.loading);
  }

  notifySuccess(response: any) {
    this.loadingSignal.set(false);
    this.responseSignal.set(response);
    this.successSignal.set(true);
    this.failedSignal.set(false);
    this.errorSignal.set(null);
    this.stateSignal.set(RequestState.success);


    if (Array.isArray(response?.data)) {
      this.items.update(prev => {
        return [...prev, ...response.data];
      });
    }

    if (response?.pageNumber) {
      this.pageNumber.set(response.pageNumber);
    }

    if (response?.pageSize) {
      this.pageSize.set(response.pageSize);
    }

    if (response?.totalRecords) {
      this.totalRecords.set(response.totalRecords);
    }

    if (response?.totalPages) {
      this.totalPages.set(response.totalPages);
    }

  }

  notifyError(errorMsg: string) {
    this.loadingSignal.set(false);
    this.responseSignal.set(null);
    this.successSignal.set(false);
    this.failedSignal.set(true);
    this.errorSignal.set(errorMsg);
    this.stateSignal.set(RequestState.error);
  }

  clearState() {
    this.loadingSignal.set(false);
    this.responseSignal.set(null);
    this.successSignal.set(false);
    this.failedSignal.set(false);
    this.errorSignal.set(null);
    this.stateSignal.set(RequestState.idle);

    this.items.set([]);
    this.pageNumber.set(1);
    this.pageSize.set(0);
    this.totalRecords.set(0);
    this.totalPages.set(0);
  }
}
