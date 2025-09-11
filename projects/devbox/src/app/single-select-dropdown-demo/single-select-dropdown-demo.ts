import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { MockApiService } from './ssdd-mock-api';
import { SelectDropdownField } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-single-select-dropdown-demo',
  imports: [SelectDropdownField, ReactiveFormsModule],
  templateUrl: './single-select-dropdown-demo.html',
  styleUrl: './single-select-dropdown-demo.css'
})
export class SingleSelectDropdownDemo {
private mockApiService = inject(MockApiService);

  // Form controls for each variant
  basicControl = new FormControl<string | null>(null);
  objectControl = new FormControl<number | null>(null);
  templateControl = new FormControl<number | null>(null);
  serverControl = new FormControl<number | null>(null);
  requiredControl = new FormControl<string | null>(null, Validators.required);

  // Options for each variant
  stringOptions = ['Red', 'Blue', 'Green', 'Yellow'];
  fruitOptions = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Orange' },
    { id: 4, name: 'Mango' },
  ];
  itemOptions = [
    { id: 1, name: 'Apple', category: 'Fruit' },
    { id: 2, name: 'Carrot', category: 'Vegetable' },
    { id: 3, name: 'Banana', category: 'Fruit' },
    { id: 4, name: 'Broccoli', category: 'Vegetable' },
  ];
  serverOptions: any[] = [];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Initialize server options
    this.mockApiService.searchOptions('').subscribe(options => {
      this.serverOptions = options;
    });

    // Set up server-side search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => this.mockApiService.searchOptions(query))
    ).subscribe(options => {
      this.serverOptions = options;
    });

    // Set some initial values for demonstration
    this.basicControl.setValue('Blue');
    this.objectControl.setValue(2);
    this.templateControl.setValue(3);
    this.serverControl.setValue(1);
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }
}
