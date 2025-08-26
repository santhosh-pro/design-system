import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastCloseButtonComponent } from './toast-close-button';

describe('CloseSvgComponent', () => {
  let component: ToastCloseButtonComponent;
  let fixture: ComponentFixture<ToastCloseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastCloseButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastCloseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
