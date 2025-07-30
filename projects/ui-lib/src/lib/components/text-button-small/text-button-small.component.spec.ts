import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextButtonSmall } from './text-button-small.component';

describe('ViewButtonComponent', () => {
  let component: TextButtonSmall;
  let fixture: ComponentFixture<TextButtonSmall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextButtonSmall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextButtonSmall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
