import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangePickerDemo } from './date-range-picker-demo';

describe('DateRangePickerDemo', () => {
  let component: DateRangePickerDemo;
  let fixture: ComponentFixture<DateRangePickerDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangePickerDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateRangePickerDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
