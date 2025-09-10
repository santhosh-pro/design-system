import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTablePickerDemo } from './data-table-picker-demo';

describe('DataTablePickerDemo', () => {
  let component: DataTablePickerDemo;
  let fixture: ComponentFixture<DataTablePickerDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTablePickerDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTablePickerDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
