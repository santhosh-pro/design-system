import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDialog } from './select-dialog';

describe('SelectDialog', () => {
  let component: SelectDialog;
  let fixture: ComponentFixture<SelectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
