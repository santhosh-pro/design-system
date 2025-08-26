import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSelectionFieldComponent } from './single-selection-field';

describe('SingleSelectionFieldComponent', () => {
  let component: SingleSelectionFieldComponent<any>;
  let fixture: ComponentFixture<SingleSelectionFieldComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSelectionFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleSelectionFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
