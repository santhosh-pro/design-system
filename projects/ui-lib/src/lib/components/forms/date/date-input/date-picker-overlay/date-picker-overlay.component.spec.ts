import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerOverlayComponent } from './date-picker-overlay.component';

describe('DatePickerOverlayComponent', () => {
  let component: DatePickerOverlayComponent;
  let fixture: ComponentFixture<DatePickerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatePickerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
