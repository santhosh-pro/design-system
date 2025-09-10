import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploaderComponent } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-file-upload-demo',
  imports: [CommonModule, ReactiveFormsModule, FileUploaderComponent],
  templateUrl: './file-upload-demo.html',
  styleUrl: './file-upload-demo.css'
})
export class FileUploadDemo {
// Reactive form
  form: FormGroup;

  // Simulated initial value (e.g., a previously uploaded file URL)
  initialFileUrl = 'https://example.com/documents/sample.pdf';

  // Error messages for validation
  errorMessages = {
    required: 'Please upload a file or select "Upload Later".',
  };

  // Track upload later state
  isUploadLater = false;

  // Simulated uploaded file for demonstration
  uploadedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      document: [null, Validators.required], // File or URL, with required validator
    });
  }

  ngOnInit(): void {
    // Set initial value for the file uploader
    this.form.get('document')?.setValue(this.initialFileUrl);
  }

  // Handle file selection
  onFileSelected(file: File): void {
    console.log('File selected:', file.name);
    this.uploadedFile = file;
    this.isUploadLater = false; // Reset upload later state
    this.form.get('document')?.setValue(file); // Update form control
  }

  // Handle file removal
  onFileRemoved(): void {
    console.log('File removed');
    this.uploadedFile = null;
    this.isUploadLater = false;
    this.form.get('document')?.setValue(null);
  }

  // Handle upload later click
  onUploadLaterClicked(): void {
    console.log('Upload later clicked');
    this.isUploadLater = true;
    this.uploadedFile = null;
    this.form.get('document')?.setValue(null); // Clear form control value
  }

  // Simulate form submission
  onSubmit(): void {
    if (this.form.valid || this.isUploadLater) {
      console.log('Form submitted', {
        document: this.uploadedFile,
        uploadLater: this.isUploadLater,
        formValue: this.form.value,
      });
    } else {
      console.log('Form invalid');
      this.form.markAllAsTouched(); // Trigger validation errors
    }
  }

  // Simulate file upload (e.g., to a server)
  uploadFile(): void {
    if (this.uploadedFile) {
      console.log('Uploading file:', this.uploadedFile.name);
      // Simulate async upload
      setTimeout(() => {
        console.log('File uploaded successfully');
      }, 1000);
    }
  }
}
