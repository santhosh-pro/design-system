import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayDemo } from './overlay-demo';

describe('OverlayDemo', () => {
  let component: OverlayDemo;
  let fixture: ComponentFixture<OverlayDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
