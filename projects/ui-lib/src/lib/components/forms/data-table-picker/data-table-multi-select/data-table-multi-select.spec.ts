import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableMultiSelect } from './data-table-multi-select';

describe('DataTableMultiSelect', () => {
  let component: DataTableMultiSelect;
  let fixture: ComponentFixture<DataTableMultiSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableMultiSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableMultiSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
