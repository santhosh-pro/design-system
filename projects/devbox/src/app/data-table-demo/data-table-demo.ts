import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card';
import { DocIoList } from '../core/doc-io-list/doc-io-list';
import { ColumnDef, ColumnGroup, DataTableComponent, TableActionEvent, TableStateEvent } from 'projects/ui-lib/src/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, DemoCard, DocIoList],
  templateUrl: './data-table-demo.html',
})
export class DataTableDemo {
  // Data for all variants
  basicData = signal<any[]>(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 30),
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    email: `user${i + 1}@example.com`,
  })));

  selectionData = signal<any[]>(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    role: ['Admin', 'User', 'Manager'][i % 3],
    department: ['HR', 'IT', 'Finance', 'Sales'][i % 4],
  })));

  actionData = signal<any[]>(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Member ${i + 1}`,
    email: `member${i + 1}@example.com`,
    role: ['Editor', 'Viewer', 'Admin'][i % 3],
  })));

  pinnableData = signal<any[]>(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Staff ${i + 1}`,
    position: ['Developer', 'Designer', 'Analyst'][i % 3],
    salary: 3000 + (i % 20) * 100,
    location: ['Remote', 'Onsite'][i % 2],
  })));

  expandableData = signal<any[]>(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Project ${i + 1}`,
    status: ['In Progress', 'Completed', 'Pending'][i % 3],
    budget: 10000 + (i % 20) * 1000,
    manager: `Manager ${i + 1}`,
  })));

  // Column definitions for all variants
  basicColumns = signal<ColumnGroup[]>([
    {
      title: 'User Info',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Age', key: 'age', type: 'text', alignment: 'center', sortKey: 'age' },
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
        { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
      ],
    },
  ]);

  selectionColumns = signal<ColumnGroup[]>([
    {
      title: 'Team Members',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Role', key: 'role', type: 'text', alignment: 'center', sortKey: 'role' },
        { title: 'Department', key: 'department', type: 'text', alignment: 'left', sortKey: 'department' },
      ],
    },
  ]);

  actionColumns = signal<ColumnGroup[]>([
    {
      title: 'User Management',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
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

  pinnableColumns = signal<ColumnGroup[]>([
    {
      title: 'Staff Details',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id', pinned: 'left' },
        { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Position', key: 'position', type: 'text', alignment: 'center', sortKey: 'position' },
        { title: 'Salary', key: 'salary', type: 'text', alignment: 'right', sortKey: 'salary' },
        { title: 'Location', key: 'location', type: 'text', alignment: 'center', sortKey: 'location', pinned: 'right' },
      ],
    },
  ]);

  expandableColumns = signal<ColumnGroup[]>([
    {
      title: 'Project Overview',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
        { title: 'Project Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        {
          title: 'Status',
          key: 'status',
          type: 'badge',
          badgeConfig: {
            properties: [
              { data: 'In Progress', displayText: 'In Progress', backgroundColorClass: 'bg-yellow-100', textColorClass: 'text-yellow-800' },
              { data: 'Completed', displayText: 'Completed', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800' },
              { data: 'Pending', displayText: 'Pending', backgroundColorClass: 'bg-gray-100', textColorClass: 'text-gray-800' },
            ],
          },
        },
        { title: 'Budget', key: 'budget', type: 'text', alignment: 'right', sortKey: 'budget' },
        { title: 'Manager', key: 'manager', type: 'text', alignment: 'left', sortKey: 'manager' },
      ],
    },
  ]);

  // Form controls for table state
  basicControl = new FormControl<TableStateEvent>({ searchText: '' });
  selectionControl = new FormControl<TableStateEvent>({ searchText: '' });
  actionControl = new FormControl<TableStateEvent>({ searchText: '' });
  pinnableControl = new FormControl<TableStateEvent>({ searchText: '' });
  expandableControl = new FormControl<TableStateEvent>({ searchText: '' });

  // Demo files for code viewer
  basicFiles = signal<DemoFile[]>([
    {
      name: 'basic-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="basicColumns()"
  [data]="basicData()"
  [pageSize]="10"
  [totalCount]="basicData().length"
  [enableSearch]="true"
  [formControl]="basicControl"
  (tableStateChanged)="onTableStateChanged($event)">
</app-data-table>`,
    },
    {
      name: 'basic-demo.component.ts',
      language: 'ts',
      code: `basicControl = new FormControl<TableStateEvent>({ searchText: '' });
basicData = signal<any[]>([
  { id: 1, name: 'User 1', age: 30, status: 'Active', email: 'user1@example.com' },
  // ... more data
]);
basicColumns = signal<ColumnGroup[]>([
  {
    title: 'User Info',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Age', key: 'age', type: 'text', alignment: 'center', sortKey: 'age' },
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
      { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}`,
    },
  ]);

  selectionFiles = signal<DemoFile[]>([
    {
      name: 'selection-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="selectionColumns()"
  [data]="selectionData()"
  [pageSize]="5"
  [totalCount]="selectionData().length"
  [enableRowSelection]="true"
  [rowSelectionKey]="'id'"
  [enableClickableRows]="true"
  [formControl]="selectionControl"
  (tableStateChanged)="onTableStateChanged($event)"
  (rowSelectionChange)="onRowSelectionChange($event)"
  (onRowClicked)="onRowClicked($event)">
</app-data-table>`,
    },
    {
      name: 'selection-demo.component.ts',
      language: 'ts',
      code: `selectionControl = new FormControl<TableStateEvent>({ searchText: '' });
selectionData = signal<any[]>([
  { id: 1, name: 'Employee 1', role: 'Admin', department: 'HR' },
  // ... more data
]);
selectionColumns = signal<ColumnGroup[]>([
  {
    title: 'Team Members',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Role', key: 'role', type: 'text', alignment: 'center', sortKey: 'role' },
      { title: 'Department', key: 'department', type: 'text', alignment: 'left', sortKey: 'department' },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}
onRowSelectionChange(event: any[]) {
  console.log('Row selection changed:', event);
}
onRowClicked(event: any) {
  console.log('Row clicked:', event);
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
  { id: 1, name: 'Member 1', email: 'member1@example.com', role: 'Editor' },
  // ... more data
]);
actionColumns = signal<ColumnGroup[]>([
  {
    title: 'User Management',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
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

  pinnableFiles = signal<DemoFile[]>([
    {
      name: 'pinnable-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="pinnableColumns()"
  [data]="pinnableData()"
  [pageSize]="5"
  [totalCount]="pinnableData().length"
  [enableHorizontallyScrollable]="true"
  [enableResizableColumns]="true"
  [maxPinnedLeft]="2"
  [maxPinnedRight]="2"
  [formControl]="pinnableControl"
  (tableStateChanged)="onTableStateChanged($event)"
  (pinChanged)="onPinChanged($event)">
</app-data-table>`,
    },
    {
      name: 'pinnable-demo.component.ts',
      language: 'ts',
      code: `pinnableControl = new FormControl<TableStateEvent>({ searchText: '' });
pinnableData = signal<any[]>([
  { id: 1, name: 'Staff 1', position: 'Developer', salary: 3000, location: 'Remote' },
  // ... more data
]);
pinnableColumns = signal<ColumnGroup[]>([
  {
    title: 'Staff Details',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id', pinned: 'left' },
      { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Position', key: 'position', type: 'text', alignment: 'center', sortKey: 'position' },
      { title: 'Salary', key: 'salary', type: 'text', alignment: 'right', sortKey: 'salary' },
      { title: 'Location', key: 'location', type: 'text', alignment: 'center', sortKey: 'location', pinned: 'right' },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}
onPinChanged(event: { column: ColumnDef; pinned: 'left' | 'right' | null }) {
  console.log('Pin changed:', event);
}`,
    },
  ]);

  expandableFiles = signal<DemoFile[]>([
    {
      name: 'expandable-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columnGroups]="expandableColumns()"
  [data]="expandableData()"
  [pageSize]="5"
  [totalCount]="expandableData().length"
  [enableSearch]="true"
  [formControl]="expandableControl"
  [expandableComponent]="expandableComponent"
  (tableStateChanged)="onTableStateChanged($event)">
</app-data-table>`,
    },
    {
      name: 'expandable-demo.component.ts',
      language: 'ts',
      code: `expandableControl = new FormControl<TableStateEvent>({ searchText: '' });
expandableData = signal<any[]>([
  { id: 1, name: 'Project 1', status: 'In Progress', budget: 10000, manager: 'Manager 1' },
  // ... more data
]);
expandableColumns = signal<ColumnGroup[]>([
  {
    title: 'Project Overview',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
      { title: 'Project Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      {
        title: 'Status',
        key: 'status',
        type: 'badge',
        badgeConfig: {
          properties: [
            { data: 'In Progress', displayText: 'In Progress', backgroundColorClass: 'bg-yellow-100', textColorClass: 'text-yellow-800' },
            { data: 'Completed', displayText: 'Completed', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800' },
            { data: 'Pending', displayText: 'Pending', backgroundColorClass: 'bg-gray-100', textColorClass: 'text-gray-800' },
          ],
        },
      },
      { title: 'Budget', key: 'budget', type: 'text', alignment: 'right', sortKey: 'budget' },
      { title: 'Manager', key: 'manager', type: 'text', alignment: 'left', sortKey: 'manager' },
    ],
  },
]);
onTableStateChanged(event: TableStateEvent) {
  console.log('Table state changed:', event);
}`,
    },
  ]);

  // Placeholder for expandable component (assumed to exist)
  expandableComponent: any = null;

  // Event handlers
  onTableStateChanged(event: TableStateEvent) {
    console.log('Table state changed:', event);
  }

  onRowSelectionChange(event: any[]) {
    console.log('Row selection changed:', event);
  }

  onRowClicked(event: any) {
    console.log('Row clicked:', event);
  }

  onActionPerformed(event: TableActionEvent) {
    console.log('Action performed:', event);
  }

  onPinChanged(event: { column: ColumnDef; pinned: 'left' | 'right' | null }) {
    console.log('Pin changed:', event);
  }
}