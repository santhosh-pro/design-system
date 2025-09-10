import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSelectDropdownDemo } from './single-select-dropdown-demo';

describe('SingleSelectDropdownDemo', () => {
  let component: SingleSelectDropdownDemo;
  let fixture: ComponentFixture<SingleSelectDropdownDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSelectDropdownDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleSelectDropdownDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
