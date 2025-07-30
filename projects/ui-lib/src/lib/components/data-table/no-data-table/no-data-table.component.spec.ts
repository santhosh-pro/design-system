import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataTableComponent } from './no-data-table.component';

describe('NoDataTableComponent', () => {
  let component: NoDataTableComponent;
  let fixture: ComponentFixture<NoDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDataTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
