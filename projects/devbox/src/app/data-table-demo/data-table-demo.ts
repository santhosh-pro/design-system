import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card'; // Adjust path as needed
import { DocIoList } from '../core/doc-io-list/doc-io-list'; // Adjust path as needed
import { ColumnGroup, DataTableComponent, FilterEvent, TableActionEvent, TableStateEvent } from 'projects/ui-lib/src/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, DemoCard, DocIoList],
  templateUrl: './data-table-demo.html',
})
export class DataTableDemo {
  // Signals for demo data
  basicData = signal<any[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 30), // random-ish ages between 20–49
      status: i % 2 === 0 ? 'Active' : 'Inactive',
      email: `user${i + 1}@example.com`,
      phone: `+91-98765${10000 + i}`,
      city: ['New York', 'London', 'Paris', 'Tokyo', 'Berlin'][i % 5],
      country: ['USA', 'UK', 'France', 'Japan', 'Germany'][i % 5],
      department: ['HR', 'IT', 'Finance', 'Sales'][i % 4],
      role: ['Admin', 'User', 'Manager'][i % 3],
      salary: 3000 + (i % 20) * 100,
      joinDate: `2023-01-${(i % 28) + 1}`,
      lastLogin: `2024-08-${(i % 28) + 1}`,
      verified: i % 2 === 0 ? 'Yes' : 'No',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      project: `Project-${(i % 10) + 1}`,
      level: ['Junior', 'Mid', 'Senior'][i % 3],
      performance: ['Good', 'Average', 'Excellent'][i % 3],
      location: ['Remote', 'Onsite'][i % 2],
      shift: ['Morning', 'Evening', 'Night'][i % 3],
    }))
  );

  filterData = signal<any[]>([
    { id: 1, name: 'Alice Brown', age: 28, joined: '2023-01-15', status: 'Active' },
    { id: 2, name: 'Charlie Davis', age: 35, joined: '2022-06-20', status: 'Inactive' },
    { id: 3, name: 'Eve Wilson', age: 22, joined: '2024-03-10', status: 'Active' },
  ]);

  actionData = signal<any[]>([
    { id: 1, name: 'Mike Ross', email: 'mike@example.com', role: 'Admin' },
    { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', role: 'User' },
    { id: 3, name: 'Tom Hanks', email: 'tom@example.com', role: 'Editor' },
  ]);

  // Column definitions for demos
  basicColumns = signal<ColumnGroup[]>([
    {
      title: 'User Info',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Age', key: 'age', type: 'text', alignment: 'center' },
        {
          title: 'Status',
          key: 'status',
          type: 'badge',
          badgeConfig: {
            properties: [
              { data: 'Active', displayText: 'Active', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800' },
              { data: 'Inactive', displayText: 'Inactive', backgroundColorClass: 'bg-red-100', textColorClass: 'text-red-800' },
            ],
          },
        },
        { title: 'Email', key: 'email', type: 'text', alignment: 'left' },
        { title: 'Phone', key: 'phone', type: 'text', alignment: 'left' },
        { title: 'City', key: 'city', type: 'text', alignment: 'left' },
        { title: 'Country', key: 'country', type: 'text', alignment: 'left' },
        { title: 'Department', key: 'department', type: 'text', alignment: 'left' },
        { title: 'Role', key: 'role', type: 'text', alignment: 'left' },
        { title: 'Salary', key: 'salary', type: 'text', alignment: 'right' },
        { title: 'Join Date', key: 'joinDate', type: 'text', alignment: 'center' },
        { title: 'Last Login', key: 'lastLogin', type: 'text', alignment: 'center' },
        { title: 'Verified', key: 'verified', type: 'text', alignment: 'center' },
        { title: 'Gender', key: 'gender', type: 'text', alignment: 'center' },
        { title: 'Project', key: 'project', type: 'text', alignment: 'left' },
        { title: 'Level', key: 'level', type: 'text', alignment: 'center' },
        { title: 'Performance', key: 'performance', type: 'text', alignment: 'center' },
        { title: 'Location', key: 'location', type: 'text', alignment: 'center' },
        { title: 'Shift', key: 'shift', type: 'text', alignment: 'center' },
      ],
    },
  ]);


  filterColumns = signal<ColumnGroup[]>([
    {
      title: 'User Details',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
        { 
          title: 'Name', 
          key: 'name', 
          type: 'text', 
          sortKey: 'name', 
          filterConfig: { type: 'text', placeholder: 'Filter by name', operation: 'contains' },
        },
        { 
          title: 'Age', 
          key: 'age', 
          type: 'text', 
          alignment: 'center', 
          filterConfig: { type: 'number', placeholder: 'Filter by age', operation: 'equal' },
        },
        { 
          title: 'Joined', 
          key: 'joined', 
          type: 'date', 
          dateConfig: { dateFormat: 'MM/dd/yyyy' }, 
          filterConfig: { type: 'date', dateFormat: 'mm/dd/yyyy', operation: 'equal' },
        },
        { 
          title: 'Status', 
          key: 'status', 
          type: 'text', 
          filterConfig: { 
            type: 'select', 
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ],
          },
        },
      ],
    },
  ]);

  actionColumns = signal<ColumnGroup[]>([
    {
      title: 'User Management',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Email', key: 'email', type: 'text', alignment: 'left' },
        { 
          title: 'Actions', 
          key: 'actions', 
          type: 'actions', 
          pinned: 'right',
          actionsConfig: {
            iconActions: [
              { iconPath: 'edit', actionKey: 'edit', label: 'Edit' },
              { iconPath: 'delete', actionKey: 'delete', label: 'Delete' },
            ],
            threeDotMenuActions: (item: any) => [
              { iconPath: 'view', actionKey: 'view', label: 'View Details' },
              { iconPath: 'archive', actionKey: 'archive', label: `Archive ${item.name}` },
            ],
          },
        },
      ],
    },
  ]);

  // Form controls for table state
  basicControl = new FormControl<TableStateEvent>({ searchText: '' });
  filterControl = new FormControl<TableStateEvent>({ searchText: '' });
  actionControl = new FormControl<TableStateEvent>({ searchText: '' });

  // Files for demo-card code viewer
  basicFiles = signal<DemoFile[]>([
    {
      name: 'basic-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="basicColumns()"
  [data]="basicData()"
  [pageSize]="5"
  [totalCount]="basicData().length"
  [formControl]="basicControl"
  (tableStateChanged)="onTableStateChanged($event)">
</app-data-table>`,
    },
    {
      name: 'basic-demo.component.ts',
      language: 'ts',
      code: `basicControl = new FormControl<TableStateEvent>({ searchText: '' });
basicData = signal<any[]>([
  { id: 1, name: 'John Doe', age: 30, status: 'Active' },
  { id: 2, name: 'Jane Smith', age: 25, status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', age: 40, status: 'Active' },
]);
basicColumns = signal<ColumnGroup[]>([
  {
    title: 'User Info',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Age', key: 'age', type: 'text', alignment: 'center' },
      { 
        title: 'Status', 
        key: 'status', 
        type: 'badge', 
        badgeConfig: {
          properties: [
            { data: 'Active', displayText: 'Active', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800' },
            { data: 'Inactive', displayText: 'Inactive', backgroundColorClass: 'bg-red-100', textColorClass: 'text-red-800' },
          ],
        },
      },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}`,
    },
  ]);

  filterFiles = signal<DemoFile[]>([
    {
      name: 'filter-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="filterColumns()"
  [data]="filterData()"
  [pageSize]="5"
  [totalCount]="filterData().length"
  [enableSearch]="true"
  [formControl]="filterControl"
  (tableStateChanged)="onTableStateChanged($event)"
  (filterChanged)="onFilterChanged($event)">
</app-data-table>`,
    },
    {
      name: 'filter-demo.component.ts',
      language: 'ts',
      code: `filterControl = new FormControl<TableStateEvent>({ searchText: '' });
filterData = signal<any[]>([
  { id: 1, name: 'Alice Brown', age: 28, joined: '2023-01-15', status: 'Active' },
  { id: 2, name: 'Charlie Davis', age: 35, joined: '2022-06-20', status: 'Inactive' },
  { id: 3, name: 'Eve Wilson', age: 22, joined: '2024-03-10', status: 'Active' },
]);
filterColumns = signal<ColumnGroup[]>([
  {
    title: 'User Details',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
      { 
        title: 'Name', 
        key: 'name', 
        type: 'text', 
        sortKey: 'name', 
        filterConfig: { type: 'text', placeholder: 'Filter by name', operation: 'contains' },
      },
      { 
        title: 'Age', 
        key: 'age', 
        type: 'number', 
        alignment: 'center', 
        filterConfig: { type: 'number', placeholder: 'Filter by age', operation: 'equal' },
      },
      { 
        title: 'Joined', 
        key: 'joined', 
        type: 'date', 
        dateConfig: { dateFormat: 'MM/dd/yyyy' }, 
        filterConfig: { type: 'date', dateFormat: 'mm/dd/yyyy', operation: 'equal' },
      },
      { 
        title: 'Status', 
        key: 'status', 
        type: 'select', 
        filterConfig: { 
          type: 'select', 
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ],
          operation: 'equals',
        },
      },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}
onFilterChanged(event: FilterEvent) {
  console.log('Filter changed:', event);
}`,
    },
  ]);

  actionFiles = signal<DemoFile[]>([
    {
      name: 'action-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="actionColumns()"
  [data]="actionData()"
  [pageSize]="5"
  [totalCount]="actionData().length"
  [enableRowSelection]="true"
  [rowSelectionKey]="'id'"
  [formControl]="actionControl"
  (tableStateChanged)="onTableStateChanged($event)"
  (onActionPerformed)="onActionPerformed($event)"
  (rowSelectionChange)="onRowSelectionChange($event)">
</app-data-table>`,
    },
    {
      name: 'action-demo.component.ts',
      language: 'ts',
      code: `actionControl = new FormControl<TableStateEvent>({ searchText: '' });
actionData = signal<any[]>([
  { id: 1, name: 'Mike Ross', email: 'mike@example.com', role: 'Admin' },
  { id: 2, name: 'Sarah Connor', email: 'sarah@example.com', role: 'User' },
  { id: 3, name: 'Tom Hanks', email: 'tom@example.com', role: 'Editor' },
]);
actionColumns = signal<ColumnGroup[]>([
  {
    title: 'User Management',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Email', key: 'email', type: 'text', alignment: 'left' },
      { 
        title: 'Actions', 
        key: 'actions', 
        type: 'actions', 
        pinned: 'right',
        actionsConfig: {
          iconActions: [
            { iconPath: 'edit', actionKey: 'edit', label: 'Edit' },
            { iconPath: 'delete', actionKey: 'delete', label: 'Delete' },
          ],
          threeDotMenuActions: (item: any) => [
            { iconPath: 'view', actionKey: 'view', label: 'View Details' },
            { iconPath: 'archive', actionKey: 'archive', label: \`Archive \${item.name}\` },
          ],
        },
      },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}
onActionPerformed(event: TableActionEvent) {
  console.log('Action performed:', event);
}
onRowSelectionChange(event: any[]) {
  console.log('Row selection changed:', event);
}`,
    },
  ]);

  // Event handlers for demo output
  onTableStateChanged(event: TableStateEvent) {
    console.log('Table state changed:', event);
  }

  onFilterChanged(event: FilterEvent) {
    console.log('Filter changed:', event);
  }

  onActionPerformed(event: TableActionEvent) {
    console.log('Action performed:', event);
  }

  onRowSelectionChange(event: any[]) {
    console.log('Row selection changed:', event);
  }
}