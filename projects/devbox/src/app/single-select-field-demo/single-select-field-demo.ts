import { Component, signal } from "@angular/core";
import { DemoCard, DemoFile } from "../core/demo-card/demo-card";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SingleSelectionFieldComponent } from "projects/ui-lib/src/public-api";
import { DocIoList } from "../core/doc-io-list/doc-io-list";

@Component({
  selector: 'app-single-selection-demo',
  standalone: true,
  imports: [ReactiveFormsModule, DemoCard, SingleSelectionFieldComponent, DocIoList],
  templateUrl: './single-select-field-demo.html'
})
export class SingleSelectionDemoComponent {
  // Signals for demo items
  colors = signal<string[]>(['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']);
  countries = signal<{ code: string; name: string }[]>([
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'JP', name: 'Japan' }
  ]);
  categories = signal<{ name: string; category: string }[]>([
    { name: 'Apple', category: 'Fruit' },
    { name: 'Carrot', category: 'Vegetable' }
  ]);

  // FormControls
  basicControl = new FormControl<string | null>(null);
  countryControl = new FormControl<string | null>(null);
  categoryControl = new FormControl<string | null>(null);

  // Files (signals) for demo-card code viewer
  basicFiles = signal<DemoFile[]>([
    {
      name: 'basic-demo.component.html',
      language: 'html',
      code: `<app-single-selection-field
  [formControl]="basicControl"
  title="Select Your Favorite Color"
  [items]="colors()"
  [fullWidth]="true">
</app-single-selection-field>`
    },
    {
      name: 'basic-demo.component.ts',
      language: 'ts',
      code: `basicControl = new FormControl<string | null>(null);
colors = signal<string[]>(['Red','Blue','Green','Yellow','Purple','Orange']);`
    }
  ]);

  countryFiles = signal<DemoFile[]>([
    {
      name: 'country-demo.component.html',
      language: 'html',
      code: `<app-single-selection-field
  [formControl]="countryControl"
  title="Select Country"
  [items]="countries()"
  labelKey="name"
  valueKey="code"
  [fullWidth]="true">
</app-single-selection-field>`
    },
    {
      name: 'country-demo.component.ts',
      language: 'ts',
      code: `countryControl = new FormControl<string | null>(null);
countries = signal([{ code: 'US', name: 'United States' },{ code: 'IN', name: 'India' }]);`
    }
  ]);

  categoryFiles = signal<DemoFile[]>([
    {
      name: 'category-demo.component.html',
      language: 'html',
      code: `<app-single-selection-field
  [formControl]="categoryControl"
  title="Select a Fruit"
  [items]="categories()"
  labelKey="name"
  categoryKey="category"
  [fullWidth]="true">
</app-single-selection-field>`
    },
    {
      name: 'category-demo.component.ts',
      language: 'ts',
      code: `categoryControl = new FormControl<string | null>(null);
categories = signal([{ name: 'Apple', category: 'Fruit' },{ name: 'Carrot', category: 'Vegetable' }]);`
    }
  ]);
}
