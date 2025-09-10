import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

// Mock service to simulate server-side search
@Injectable({ providedIn: 'root' })
export class MockApiService {
  private allOptions = [
    { id: 1, name: 'Apple', category: 'Fruit' },
    { id: 2, name: 'Banana', category: 'Fruit' },
    { id: 3, name: 'Carrot', category: 'Vegetable' },
    { id: 4, name: 'Broccoli', category: 'Vegetable' },
    { id: 5, name: 'Orange', category: 'Fruit' },
    { id: 6, name: 'Spinach', category: 'Vegetable' },
  ];

  searchOptions(query: string): Observable<any[]> {
    if (!query) return of(this.allOptions);
    return of(
      this.allOptions.filter(option =>
        option.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}