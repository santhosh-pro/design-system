import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberFieldDemo } from './number-field-demo';

describe('NumberFieldDemo', () => {
  let component: NumberFieldDemo;
  let fixture: ComponentFixture<NumberFieldDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberFieldDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberFieldDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
