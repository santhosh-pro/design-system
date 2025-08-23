import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayContextMenuComponent } from './overlay-context-menu.component';

describe('OverlayContextMenuComponent', () => {
  let component: OverlayContextMenuComponent;
  let fixture: ComponentFixture<OverlayContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayContextMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
