import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MultiSelectDropdownAppearance, MultiSelectDropdownComponent } from 'projects/ui-lib/src/public-api';
import { BehaviorSubject, Observable, debounceTime, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-multi-select-dropdown',
  imports: [MultiSelectDropdownComponent, ReactiveFormsModule, JsonPipe],
  templateUrl: './multi-select-dropdown.html',
  styleUrl: './multi-select-dropdown.css'
})
export class MultiSelectDropdown {
// Sample options for all variants
  options: any[] = [
    { id: 1, name: 'Apple', value: 'apple' },
    { id: 2, name: 'Banana', value: 'banana' },
    { id: 3, name: 'Orange', value: 'orange' },
    { id: 4, name: 'Mango', value: 'mango' },
    { id: 5, name: 'Grape', value: 'grape' }
  ];

  // Form controls for different variants
  standardControl = new FormControl<string[]>([],[Validators.required]);
  csvControl = new FormControl<string[]>([],[Validators.required]);
  chipsControl = new FormControl<string[]>([],[Validators.required]);
  serverSearchControl = new FormControl<string[]>([],[Validators.required]);

  // Signals for server-side search options
  serverSearchOptions = signal<any[]>(this.options);

  // Enum for appearance
  MultiSelectDropdownAppearance = MultiSelectDropdownAppearance;

  // Simulated server search
  private searchSubject = new BehaviorSubject<string>('');
  searchResults: Observable<any[]> = this.searchSubject.pipe(
    debounceTime(300),
    switchMap(searchTerm => this.simulateServerSearch(searchTerm))
  );

  constructor() {
    // Subscribe to server search results
    this.searchResults.subscribe(results => {
      this.serverSearchOptions.set(results);
    });
  }

  // Handle search input for server-side variant
  onSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  // Handle add action
  onAddAction() {
    console.log('Add action triggered');
    // Add logic to handle adding new options
  }

  // Simulate server-side search
  private simulateServerSearch(searchTerm: string): Observable<any[]> {
    if (!searchTerm) {
      return of(this.options);
    }
    const filtered = this.options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }

  // Handle value changes
  onStandardChange(value: string[]) {
    console.log('Standard selection:', value);
  }

  onCsvChange(value: string[]) {
    console.log('CSV selection:', value);
  }

  onChipsChange(value: string[]) {
    console.log('Chips selection:', value);
  }

  onServerSearchChange(value: string[]) {
    console.log('Server search selection:', value);
  }
}
