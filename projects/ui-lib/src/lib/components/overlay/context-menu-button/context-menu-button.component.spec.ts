import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuButtonComponent } from './context-menu-button.component';

describe('ContextMenuButtonComponent', () => {
  let component: ContextMenuButtonComponent;
  let fixture: ComponentFixture<ContextMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
