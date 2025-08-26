import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuIconComponent } from './context-menu-icon';

describe('ThreeDotMenuComponent', () => {
  let component: ContextMenuIconComponent;
  let fixture: ComponentFixture<ContextMenuIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
