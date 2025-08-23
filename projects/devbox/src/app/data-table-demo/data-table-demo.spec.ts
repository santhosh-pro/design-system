import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableDemo } from './data-table-demo';

describe('DataTableDemo', () => {
  let component: DataTableDemo;
  let fixture: ComponentFixture<DataTableDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
