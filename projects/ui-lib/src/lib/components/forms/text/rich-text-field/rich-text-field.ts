import { Component, ElementRef, output, signal, viewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { BaseControlValueAccessor } from '../../../../core/base-control-value-accessor';

import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
// Dynamic import type for Quill
type QuillType = typeof import('quill').default;
type DeltaType = typeof import('quill').Delta;

@Component({
  selector: 'ui-rich-text-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-field.html',
  styleUrls: ['./rich-text-field.css'],
})
export class RichTextField extends BaseControlValueAccessor<string> {
  // ViewChild signal for editor element
  editorElement = viewChild.required<ElementRef>('editorElement');

  // Signal for Quill instance
  quill = signal<InstanceType<QuillType> | null>(null);

  // Output for editor focus
  editorFocused = output<void>();

  // Store Quill constructor and Delta for dynamic loading
  private QuillConstructor: QuillType | null = null;
  private Delta: DeltaType | null = null;
  
  // Flag to prevent infinite loops during programmatic updates
  private isUpdatingContent = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super();
  }

  protected onValueReady(value: string | null): void {
    const quill = this.quill();
    if (isPlatformBrowser(this.platformId) && quill && value && !this.isUpdatingContent) {
      this.setContentSafely(value);
    }
  }

  async ngAfterViewInit() {
    // Only initialize Quill in browser environment
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Dynamically import Quill only when in browser
        const QuillModule = await import('quill');
        this.QuillConstructor = QuillModule.default;
        this.Delta = QuillModule.Delta;

        const quillInstance = new this.QuillConstructor(this.editorElement().nativeElement, {
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
            ],
          }
        });

        this.quill.set(quillInstance);

        // Set initial value if available
        if (this.formControl.value) {
          this.setContentSafely(this.formControl.value);
        }

        // Handle text changes
        quillInstance.on('text-change', (delta: any, oldDelta: any, source: any) => {
          if (source === 'user' && !this.isUpdatingContent) {
            const content = quillInstance.root.innerHTML;
            this.isUpdatingContent = true;
            this.formControl.setValue(content, { emitEvent: false });
            this.onValueChange(content);
            // Use setTimeout to reset the flag after the change propagates
            setTimeout(() => {
              this.isUpdatingContent = false;
            }, 0);
          }
        });

        // Handle selection changes
        quillInstance.on('selection-change', (range: any) => {
          if (range) {
            this.markTouched();
            this.editorFocused.emit();
          }
        });
      } catch (error) {
        console.error('Failed to load Quill:', error);
      }
    }
  }

  /**
   * Safely set content without losing cursor position
   */
  private setContentSafely(value: string) {
    const quill = this.quill();
    if (!quill || this.isUpdatingContent) return;

    // Store current selection
    const selection = quill.getSelection();
    
    this.isUpdatingContent = true;
    
    // Only update if content is different
    const currentContent = quill.root.innerHTML;
    if (currentContent !== value) {
      quill.clipboard.dangerouslyPasteHTML(value);
      
      // Restore selection if it existed and is still valid
      if (selection) {
        setTimeout(() => {
          try {
            const textLength = quill.getLength();
            const safeIndex = Math.min(selection.index, textLength - 1);
            const safeLength = Math.min(selection.length, textLength - safeIndex);
            quill.setSelection(safeIndex, safeLength);
          } catch (e) {
            // If selection restoration fails, place cursor at end
            quill.setSelection(quill.getLength() - 1);
          }
        }, 0);
      }
    }
    
    setTimeout(() => {
      this.isUpdatingContent = false;
    }, 0);
  }

  setValue(value: string | null) {
    if (isPlatformBrowser(this.platformId) && value) {
      this.setContentSafely(value);
      this.formControl.setValue(value, { emitEvent: false });
      this.onValueChange(value);
    }
  }

  /**
   * Insert content at cursor position without losing focus
   */
  private insertContentAtCursor(content: string) {
    const quill = this.quill();
    if (!quill) return;

    const selection = quill.getSelection() || { index: quill.getLength() - 1, length: 0 };
    
    this.isUpdatingContent = true;
    
    // Insert content at cursor position
    quill.clipboard.dangerouslyPasteHTML(selection.index, content);
    
    // Move cursor after inserted content
    setTimeout(() => {
      try {
        const newPosition = selection.index + content.length;
        quill.setSelection(newPosition);
        
        // Update form control
        const updatedContent = quill.root.innerHTML;
        this.formControl.setValue(updatedContent, { emitEvent: false });
        this.onValueChange(updatedContent);
      } catch (e) {
        console.warn('Failed to restore cursor position after insert:', e);
      } finally {
        this.isUpdatingContent = false;
      }
    }, 0);
  }

  preview() {
    const quill = this.quill();
    if (isPlatformBrowser(this.platformId) && quill) {
      const contentHTML = quill.root.innerHTML;

      let newTab = window.open();
      newTab?.document.open();
      
      newTab?.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview</title>
            <link href="https://cdn.quilljs.com/1.3.6/quill.core.css" rel="stylesheet">
            <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
            <style></style>
          </head>
          <body class="ql-editor">
            ${contentHTML}
          </body>
        </html>
      `);
      newTab?.document.close();
    }
  }

  insertImageWithLink(imageUrl: string, linkText: string, type: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (type === 'link') {
      const linkWithText = `<a href="${imageUrl}" target="_blank" download="${linkText}">${linkText}</a>`;
      this.insertContentAtCursor(linkWithText);
    } else if (imageUrl) {
      const imgWithLink = `<a href="${imageUrl}" target="_blank"><img width=200px height=200px src="${imageUrl}" /></a>`;
      this.insertContentAtCursor(imgWithLink);
    }
  }

  insertDocumentLink(documentUrl: string, linkText: string) {
    if (!isPlatformBrowser(this.platformId) || !documentUrl || !linkText) return;
    
    const linkWithText = `<a href="${documentUrl}" target="_blank" download="${linkText}">${linkText}</a>`;
    this.insertContentAtCursor(linkWithText);
  }

  insertLink(url: string, text: string) {
    if (!isPlatformBrowser(this.platformId) || !url || !text) return;
    
    const linkWithText = `<a href="${url}" target="_blank" download="${text}">${text}</a>`;
    this.insertContentAtCursor(linkWithText);
  }

  insertVideoWithLink(videoUrl: string, linkUrl: string) {
    if (!isPlatformBrowser(this.platformId) || !videoUrl || !linkUrl) return;
    
    const videoWithLink = `<a href="${videoUrl}" target="_blank" download="${videoUrl}">${linkUrl}</a>`;
    this.insertContentAtCursor(videoWithLink);
  }
}