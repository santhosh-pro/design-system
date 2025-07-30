import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLib } from './ui-lib';

describe('UiLib', () => {
  let component: UiLib;
  let fixture: ComponentFixture<UiLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
