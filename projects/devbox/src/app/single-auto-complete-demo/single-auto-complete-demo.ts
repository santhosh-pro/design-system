import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SingleSelectionAutoComplete } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-single-auto-complete-demo',
  imports: [
    SingleSelectionAutoComplete,
    ReactiveFormsModule,
    JsonPipe
],
  templateUrl: './single-auto-complete-demo.html',
})
export class SingleAutoCompleteDemo {
// Form
  form: FormGroup;

  // Signals
users = signal<any[]>([
  { id: 1, name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Bob Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'Alice Brown', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
]);

  searchTerm = signal<string>('');
  selectedUser = signal<any | null>(null);
  lastSearch = signal<string>('');

  // Computed
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(user => user.name.toLowerCase().includes(term));
  });

  // Configuration
  errorMessages = {
    required: 'Please select a user.',
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      user: [null], // Add Validators.required here if needed
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.lastSearch.set(searchTerm);
  }

  onValueChange(value: number | null): void {
    const selected = value !== null ? this.users().find(user => user.id === value) : null;
    this.selectedUser.set(selected ?? null);
  }
}
