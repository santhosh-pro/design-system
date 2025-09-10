import { Component, OnInit, input, output, signal } from '@angular/core';
import { BaseControlValueAccessor } from '../../../core/base-control-value-accessor';
import { SpinnerComponent } from '../../feedback/spinner/spinner';
import { HumanizeFormMessagesPipe } from '../../misc/humanize-form-messages';
import { AppSvgIconComponent } from '../../misc/app-svg-icon/app-svg-icon';

@Component({
  selector: 'ui-file-uploader',
  standalone: true,
  imports: [SpinnerComponent, HumanizeFormMessagesPipe, AppSvgIconComponent],
  templateUrl: './file-uploader.component.html',
})
export class FileUploaderComponent
  extends BaseControlValueAccessor<File | string | null>
  implements OnInit
{
  // Inputs
  fullWidth = input(false);
  label = input<string | null>(null, { alias: 'title' });
  value = input<File | string | null>(null);
  uploading = input(false);
  enableUploadLater = input(false);
  markedUploadLater = input(false);

  // Outputs
  fileSelect = output<File>();
  fileRemoved = output<void>();
  uploadLaterClicked = output<void>();

  // Signals
  fileInputId = signal<string>('');
  onHover = signal(false);

  ngOnInit(): void {
    this.fileInputId.set(this.generateUniqueId());
    if (this.formControl) {
      this.formControl.setValue(this.value(), { emitEvent: false });
    }
  }

  protected override onValueReady(value: File | string | null): void {
    if (this.formControl && value !== this.formControl.value) {
      this.formControl.setValue(value ?? this.value(), { emitEvent: false });
    }
  }

  onFileChange(event: Event): void {
    if (this.isDisabled()) return;

    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      this.onValueChange(firstFile); // Use inherited onValueChange
      this.fileSelect.emit(firstFile);
      this.markTouched(); // Use inherited markTouched
    }
  }

  onRemoveFileClicked(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isDisabled()) return;

    this.onValueChange(null); // Use inherited onValueChange
    this.fileRemoved.emit();
    this.markTouched(); // Use inherited markTouched
    // Reset the file input to allow re-selecting the same file
    const input = document.getElementById(this.fileInputId()) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  onViewFileClicked(event: MouseEvent): void {
    event.stopPropagation();
    const value = this.formControl?.value;
    if (!value) return;

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else if (typeof value === 'string') {
      window.open(value, '_blank');
    }
  }

  onContainerClick(): void {
    if (this.isDisabled() || this.uploading() || this.markedUploadLater() || this.formControl?.value) return;
    const input = document.getElementById(this.fileInputId()) as HTMLInputElement;
    input?.click();
  }

  onContainerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.uploading() || this.markedUploadLater() || this.formControl?.value) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const input = document.getElementById(this.fileInputId()) as HTMLInputElement;
      input?.click();
    }
  }

  getFileName(): string {
    const value = this.formControl?.value;
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (typeof value === 'string') return this.getFileNameFromUrl(value);
    return '';
  }

  private getFileNameFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return decodeURIComponent(parsedUrl.pathname.split('/').pop() || '');
    } catch {
      return decodeURIComponent(url.split('/').pop() || '');
    }
  }

  onMouseEnter(): void {
    if (!this.isDisabled()) {
      this.onHover.set(true);
    }
  }

  onMouseLeave(): void {
    this.onHover.set(false);
  }

  onUploadLaterClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isDisabled()) {
      this.uploadLaterClicked.emit();
    }
  }

  private generateUniqueId(): string {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `file-input-${randomNumber}`;
  }

}