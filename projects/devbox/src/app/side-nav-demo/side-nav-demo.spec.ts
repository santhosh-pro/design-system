import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavDemo } from './side-nav-demo';

describe('SideNavDemo', () => {
  let component: SideNavDemo;
  let fixture: ComponentFixture<SideNavDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
