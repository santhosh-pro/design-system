import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadDemo } from './file-upload-demo';

describe('FileUploadDemo', () => {
  let component: FileUploadDemo;
  let fixture: ComponentFixture<FileUploadDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadDemo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
