import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSelectDropdown } from './single-select-dropdown';

describe('SingleSelectDropdown', () => {
  let component: SingleSelectDropdown;
  let fixture: ComponentFixture<SingleSelectDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSelectDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleSelectDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
