import {Component, ElementRef, inject} from "@angular/core";
import {combineLatest, Observable, skip, Subscription} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {RequestState, State} from "./base-state";
import {filter, map} from "rxjs/operators";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ToastService} from "../components/toast/toast.service";
import {LoaderService} from "../components/loader/loader.service";
import { PaginationState } from "./base-pagination-state";

// Name -> AsyncResource, AsyncValue, AsyncResult, AsyncDate

@Component({
  template: '',
})
export abstract class BaseComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  toasterService = inject(ToastService);
  loaderService = inject(LoaderService);
  elementRef = inject(ElementRef);

  private subscriptions: Subscription[] = [];


  


  validateForm(formGroup: FormGroup | FormArray | null) {
    // this.validateFormGroupOrArray(formGroup);
    formGroup?.markAllAsTouched();
    this.scrollToFirstInvalidControl();
    if (formGroup?.valid) {
      formGroup?.markAsPristine();
    }
  }

  validateFormGroupOrArray(formGroup: FormGroup | FormArray | null) {
    if (formGroup instanceof FormGroup) {
      Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({onlySelf: true});
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          this.validateFormGroupOrArray(control);
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => {
        if (control instanceof FormControl) {
          control.markAsTouched({onlySelf: true});
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          this.validateFormGroupOrArray(control);
        }
      });
    }
  }

  findFirstInvalidControl(formGroup: FormGroup | FormArray | null): HTMLElement | null {
    if (formGroup instanceof FormGroup) {
      for (const field in formGroup.controls) {
        const control = formGroup.get(field);
        if (control instanceof FormControl && control.invalid) {
          return this.elementRef.nativeElement.querySelector(`[formcontrolname="${field}"]`);
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          const invalidControl = this.findFirstInvalidControl(control);
          if (invalidControl) {
            return invalidControl;
          }
        }
      }
    } else if (formGroup instanceof FormArray) {
      for (const control of formGroup.controls) {
        if (control instanceof FormControl && control.invalid) {
          return this.elementRef.nativeElement.querySelector(`[formcontrolname="${control}"]`);
        } else if (control instanceof FormGroup || control instanceof FormArray) {
          const invalidControl = this.findFirstInvalidControl(control);
          if (invalidControl) {
            return invalidControl;
          }
        }
      }
    }
    return null;
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.elementRef.nativeElement.querySelector(
      "form .ng-invalid"
    );

    if (firstInvalidControl) {
      this.toasterService.error('Please fill in all required fields');
      window.scroll({
        top: this.getTopOffset(firstInvalidControl),
        left: 0,
        behavior: "smooth"
      });
      firstInvalidControl.focus();
    }

  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  // ngOnDestroy(): void {
  //   this.subscriptions.forEach(subscription => {
  //     if (subscription && !subscription.closed) {
  //       subscription.unsubscribe();
  //     }
  //   });
  //   this.subscriptions = [];
  // }

  // abstract addObservers(): Subscription[];

  mergeQueryParams(params: {}) {
    this.router.navigate([], {queryParams: params, queryParamsHandling: "merge"});
  }

  setQueryParams(params: {}) {
    this.router.navigate([], {queryParams: params});
  }

  subscribeToUrl(
    callback: (params: any, url: string) => void
  ): Subscription {
    let isFirstEmission = true;

    return combineLatest([
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        skip(1)
      ),
      this.route.queryParamMap,
      this.route.url.pipe(
        map(segments => segments.join(''))
      )
    ]).subscribe(([navigationEnd, params, url]) => {
      callback(params, url);
    });

    // return this.route.queryParams.pipe(
    //   filter(() => {
    //     if (isFirstEmission) {
    //       isFirstEmission = false;
    //       return false;
    //     }
    //     return true;
    //   })
    // ).subscribe(params => {
    //   callback(params);
    // });
  }

  subscribeToQueryParams(callback: (params: any) => void) {
    let isFirstEmission = true;
    return this.route.queryParams.pipe(
      filter(() => {
        if (isFirstEmission) {
          isFirstEmission = false;
          return false;
        }
        return true;
      })
    ).subscribe(params => {
      callback(params);
    });
  }


  executeRequest<T>({
                      state,
                      request,
                      onLoading,
                      onSuccess,
                      onFailed,
                      handleSuccess = false,
                      handleError = true,
                      successMessage,
                      errorMessage,
                      showLoader = false
                    }: {
    state: State<T> | PaginationState<T>;
    request: Observable<T> | Promise<T>;
    onLoading?: () => void,
    onSuccess?: (response: T) => void;
    onFailed?: (error: HttpErrorResponse) => void;
    handleSuccess?: boolean,
    handleError?: boolean,
    successMessage?: string;
    errorMessage?: string;
    showLoader?: boolean
  }): void {

    /**
     * Observable Handler
     */

    if (successMessage) {
      handleSuccess = true;
    }

    if (this.isObservable(request)) {
      if (onLoading != null) {
        onLoading();
      }

      if (showLoader) {
        this.loaderService.show();
      }

      // TODO: Trial
      if (state.state() == RequestState.idle) {
        if (state instanceof State) {
          state.notifyInitialLoading();
        }
      } else {
        state.notifyLoading();
      }

      if(state instanceof PaginationState) {
        state.notifyLoading();
      }

      request?.subscribe({
        next: (res: any) => {
          let messageToShow = res?.successMessage;

          if (successMessage != null) {
            messageToShow = successMessage;
          }
          if (handleSuccess) {
            this.toasterService.success(messageToShow ?? 'Request successful');
          }
          state.notifySuccess(res);
          if (onSuccess != null) {
            onSuccess(res);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (handleError) {
            const errorMessages = err?.error?.errorMessages ?? [];
            let error = 'Unknown error, please contact administrator.';
            if (errorMessages.length > 0) {
              error = errorMessages[0];
            }
            this.toasterService.error(error);
          }
          if (showLoader) {
            this.loaderService.hide();
          }
          state.notifyError(err.error);
          if (onFailed != null) {
            onFailed(err);
          }
        },
        complete: () => {
          if (showLoader) {
            this.loaderService.hide();
          }
        },
      });

    }


    /**
     * Promise Handler
     */
    if (this.isPromise(request)) {
      if (onLoading != null) {
        onLoading();
      }

      if (showLoader) {
        this.loaderService.show();
      }
      state.notifyLoading();

      request.then((value) => {
        if (handleSuccess) {
          this.toasterService.success(successMessage ?? 'Request successful');
        }

        state.notifySuccess(value);
        if (onSuccess != null) {
          onSuccess(value);
        }
      }).catch((error) => {
        if (handleError) {
          this.toasterService.error(errorMessage ?? error ?? 'Unknown error, please contact administrator.');
        }
        state.notifyError(error);
        if (onFailed != null) {
          onFailed(error);
        }
      }).finally(() => {
        if (showLoader) {
          this.loaderService.hide();
        }
      });
    }
  }

  isObservable<T>(input: any): input is Observable<T> {
    return input && typeof input.subscribe === 'function';
  }


  isPromise<T>(input: any): input is Promise<T> {
    return input && typeof input.then === 'function';
  }

}
