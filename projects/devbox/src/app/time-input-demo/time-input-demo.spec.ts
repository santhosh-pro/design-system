import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeInputDemo } from './time-input-demo';

describe('TimeInputDemo', () => {
  let component: TimeInputDemo;
  let fixture: ComponentFixture<TimeInputDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeInputDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeInputDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
