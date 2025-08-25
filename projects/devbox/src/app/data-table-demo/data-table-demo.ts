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


  scrollableColumns = signal<ColumnGroup[]>([
  {
    title: 'Staff Details',
    columns: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id', pinned: 'left' },
      { title: 'Full Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
      { title: 'Position', key: 'position', type: 'text', alignment: 'center', sortKey: 'position' },
      { title: 'Salary', key: 'salary', type: 'text', alignment: 'right', sortKey: 'salary' },
      { title: 'Location', key: 'location', type: 'text', alignment: 'center', sortKey: 'location', pinned: 'right' },
      { title: 'Department', key: 'department', type: 'text', alignment: 'left', sortKey: 'department' },
      { title: 'Hire Date', key: 'hireDate', type: 'text', alignment: 'center', sortKey: 'hireDate' },
      { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
      { title: 'Phone', key: 'phone', type: 'text', alignment: 'left', sortKey: 'phone' },
      { title: 'Status', key: 'status', type: 'text', alignment: 'center', sortKey: 'status' },
      { title: 'Experience (Years)', key: 'experience', type: 'text', alignment: 'right', sortKey: 'experience' },
      { title: 'Team', key: 'team', type: 'text', alignment: 'left', sortKey: 'team' },
      { title: 'Manager', key: 'manager', type: 'text', alignment: 'left', sortKey: 'manager' },
      { title: 'Office', key: 'office', type: 'text', alignment: 'center', sortKey: 'office' },
      { title: 'Performance Score', key: 'performanceScore', type: 'text', alignment: 'right', sortKey: 'performanceScore' },
      { title: 'Last Review', key: 'lastReview', type: 'text', alignment: 'center', sortKey: 'lastReview' },
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
  scrollableControl = new FormControl<TableStateEvent>({ searchText: '' });
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

  scrollableFiles = signal<DemoFile[]>([
  {
    name: 'scrollable-demo.component.html',
    language: 'html',
    code: `<app-data-table
  [columnGroups]="scrollableColumns()"
  [data]="scrollableData()"
  [pageSize]="5"
  [totalCount]="scrollableData().length"
  [enableHorizontallyScrollable]="true"
  [enableResizableColumns]="true"
  [maxPinnedLeft]="2"
  [maxPinnedRight]="2"
  [formControl]="scrollableControl"
  (tableStateChanged)="onTableStateChanged($event)"
  (pinChanged)="onPinChanged($event)">
</app-data-table>`,
  },
  {
    name: 'scrollable-demo.component.ts',
    language: 'ts',
    code: `import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';

interface ColumnDef {
  title: string;
  key: string;
  type: string;
  alignment: 'left' | 'center' | 'right';
  sortKey: string;
  pinned?: 'left' | 'right' | null;
}

interface ColumnGroup {
  title: string;
  columns: ColumnDef[];
}

interface TableStateEvent {
  searchText: string;
}

@Component({
  selector: 'app-scrollable-demo',
  templateUrl: './scrollable-demo.component.html',
})
export class ScrollableDemoComponent {
  scrollableColumns = signal<ColumnGroup[]>([
    {
      title: 'Staff Details',
      columns: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id', pinned: 'left' },
        { title: 'Full Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
        { title: 'Position', key: 'position', type: 'text', alignment: 'center', sortKey: 'position' },
        { title: 'Salary', key: 'salary', type: 'text', alignment: 'right', sortKey: 'salary' },
        { title: 'Location', key: 'location', type: 'text', alignment: 'center', sortKey: 'location', pinned: 'right' },
        { title: 'Department', key: 'department', type: 'text', alignment: 'left', sortKey: 'department' },
        { title: 'Hire Date', key: 'hireDate', type: 'text', alignment: 'center', sortKey: 'hireDate' },
        { title: 'Email', key: 'email', type: 'text', alignment: 'left', sortKey: 'email' },
        { title: 'Phone', key: 'phone', type: 'text', alignment: 'left', sortKey: 'phone' },
        { title: 'Status', key: 'status', type: 'text', alignment: 'center', sortKey: 'status' },
        { title: 'Experience (Years)', key: 'experience', type: 'text', alignment: 'right', sortKey: 'experience' },
        { title: 'Team', key: 'team', type: 'text', alignment: 'left', sortKey: 'team' },
        { title: 'Manager', key: 'manager', type: 'text', alignment: 'left', sortKey: 'manager' },
        { title: 'Office', key: 'office', type: 'text', alignment: 'center', sortKey: 'office' },
        { title: 'Performance Score', key: 'performanceScore', type: 'text', alignment: 'right', sortKey: 'performanceScore' },
        { title: 'Last Review', key: 'lastReview', type: 'text', alignment: 'center', sortKey: 'lastReview' },
      ],
    },
  ]);

  scrollableData = signal<any[]>([
    { id: 1, name: 'John Doe', position: 'Developer', salary: 75000, location: 'Remote', department: 'Engineering', hireDate: '2020-01-15', email: 'john.doe@example.com', phone: '123-456-7890', status: 'Active', experience: 5, team: 'Frontend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.5, lastReview: '2025-06-01' },
    { id: 2, name: 'Jane Smith', position: 'Designer', salary: 65000, location: 'New York', department: 'Design', hireDate: '2019-03-22', email: 'jane.smith@example.com', phone: '234-567-8901', status: 'Active', experience: 4, team: 'UI/UX', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.2, lastReview: '2025-05-15' },
    { id: 3, name: 'Michael Brown', position: 'Manager', salary: 90000, location: 'Chicago', department: 'Management', hireDate: '2018-07-10', email: 'michael.brown@example.com', phone: '345-678-9012', status: 'Active', experience: 8, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.8, lastReview: '2025-07-01' },
    { id: 4, name: 'Emily Davis', position: 'Analyst', salary: 60000, location: 'San Francisco', department: 'Analytics', hireDate: '2021-02-18', email: 'emily.davis@example.com', phone: '456-789-0123', status: 'Active', experience: 3, team: 'Data', manager: 'David Lee', office: 'Branch B', performanceScore: 4.0, lastReview: '2025-04-20' },
    { id: 5, name: 'William Johnson', position: 'Engineer', salary: 80000, location: 'Remote', department: 'Engineering', hireDate: '2020-09-05', email: 'william.johnson@example.com', phone: '567-890-1234', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.7, lastReview: '2025-06-10' },
    { id: 6, name: 'Olivia Wilson', position: 'Developer', salary: 72000, location: 'Austin', department: 'Engineering', hireDate: '2021-11-30', email: 'olivia.wilson@example.com', phone: '678-901-2345', status: 'Active', experience: 4, team: 'Full Stack', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.3, lastReview: '2025-05-25' },
    { id: 7, name: 'James Taylor', position: 'Designer', salary: 67000, location: 'Remote', department: 'Design', hireDate: '2020-04-12', email: 'james.taylor@example.com', phone: '789-012-3456', status: 'Inactive', experience: 5, team: 'UI/UX', manager: 'Carol White', office: 'HQ', performanceScore: 3.9, lastReview: '2024-12-15' },
    { id: 8, name: 'Sophia Martinez', position: 'Analyst', salary: 62000, location: 'Boston', department: 'Analytics', hireDate: '2022-01-25', email: 'sophia.martinez@example.com', phone: '890-123-4567', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'Branch B', performanceScore: 4.1, lastReview: '2025-03-10' },
    { id: 9, name: 'Liam Anderson', position: 'Engineer', salary: 78000, location: 'Seattle', department: 'Engineering', hireDate: '2019-06-17', email: 'liam.anderson@example.com', phone: '901-234-5678', status: 'Active', experience: 7, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.6, lastReview: '2025-06-20' },
    { id: 10, name: 'Ava Thompson', position: 'Manager', salary: 95000, location: 'Remote', department: 'Management', hireDate: '2017-10-08', email: 'ava.thompson@example.com', phone: '012-345-6789', status: 'Active', experience: 9, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.9, lastReview: '2025-07-05' },
    { id: 11, name: 'Noah White', position: 'Developer', salary: 74000, location: 'Denver', department: 'Engineering', hireDate: '2021-03-14', email: 'noah.white@example.com', phone: '123-456-7891', status: 'Active', experience: 3, team: 'Frontend', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.4, lastReview: '2025-05-30' },
    { id: 12, name: 'Isabella Lee', position: 'Designer', salary: 66000, location: 'Miami', department: 'Design', hireDate: '2020-08-20', email: 'isabella.lee@example.com', phone: '234-567-8902', status: 'Active', experience: 4, team: 'UI/UX', manager: 'Carol White', office: 'Branch B', performanceScore: 4.2, lastReview: '2025-04-25' },
    { id: 13, name: 'Ethan Harris', position: 'Analyst', salary: 61000, location: 'Remote', department: 'Analytics', hireDate: '2022-05-10', email: 'ethan.harris@example.com', phone: '345-678-9013', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'HQ', performanceScore: 4.0, lastReview: '2025-03-15' },
    { id: 14, name: 'Mia Clark', position: 'Engineer', salary: 79000, location: 'San Francisco', department: 'Engineering', hireDate: '2019-12-01', email: 'mia.clark@example.com', phone: '456-789-0124', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'Branch A', performanceScore: 4.5, lastReview: '2025-06-15' },
    { id: 15, name: 'Alexander Lewis', position: 'Manager', salary: 92000, location: 'Chicago', department: 'Management', hireDate: '2018-02-28', email: 'alexander.lewis@example.com', phone: '567-890-1235', status: 'Active', experience: 8, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.7, lastReview: '2025-07-10' },
    { id: 16, name: 'Charlotte Walker', position: 'Developer', salary: 73000, location: 'Remote', department: 'Engineering', hireDate: '2021-07-19', email: 'charlotte.walker@example.com', phone: '678-901-2346', status: 'Active', experience: 3, team: 'Full Stack', manager: 'Bob Johnson', office: 'Branch B', performanceScore: 4.3, lastReview: '2025-05-20' },
    { id: 17, name: 'Daniel Young', position: 'Designer', salary: 68000, location: 'Austin', department: 'Design', hireDate: '2020-11-05', email: 'daniel.young@example.com', phone: '789-012-3457', status: 'Active', experience: 5, team: 'UI/UX', manager: 'Carol White', office: 'HQ', performanceScore: 4.1, lastReview: '2025-04-30' },
    { id: 18, name: 'Amelia King', position: 'Analyst', salary: 63000, location: 'Boston', department: 'Analytics', hireDate: '2022-03-15', email: 'amelia.king@example.com', phone: '890-123-4568', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'Branch A', performanceScore: 4.0, lastReview: '2025-03-20' },
    { id: 19, name: 'Henry Scott', position: 'Engineer', salary: 77000, location: 'Seattle', department: 'Engineering', hireDate: '2019-09-25', email: 'henry.scott@example.com', phone: '901-234-5679', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.6, lastReview: '2025-06-25' },
    { id: 20, name: 'Evelyn Adams', position: 'Manager', salary: 94000, location: 'Remote', department: 'Management', hireDate: '2017-12-10', email: 'evelyn.adams@example.com', phone: '012-345-6790', status: 'Active', experience: 9, team: 'Leadership', manager: 'Carol White', office: 'Branch B', performanceScore: 4.8, lastReview: '2025-07-15' },
  ]);

  scrollableControl = new FormControl<TableStateEvent>({ searchText: '' });

  onTableStateChanged(event: TableStateEvent) {
    console.log('Table state changed:', event);
  }

  onPinChanged(event: { column: ColumnDef; pinned: 'left' | 'right' | null }) {
    console.log('Pin changed:', event);
  }
}
`,
  },
]);

  scrollableData = signal<any[]>([
  { id: 1, name: 'John Doe', position: 'Developer', salary: 75000, location: 'Remote', department: 'Engineering', hireDate: '2020-01-15', email: 'john.doe@example.com', phone: '123-456-7890', status: 'Active', experience: 5, team: 'Frontend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.5, lastReview: '2025-06-01' },
  { id: 2, name: 'Jane Smith', position: 'Designer', salary: 65000, location: 'New York', department: 'Design', hireDate: '2019-03-22', email: 'jane.smith@example.com', phone: '234-567-8901', status: 'Active', experience: 4, team: 'UI/UX', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.2, lastReview: '2025-05-15' },
  { id: 3, name: 'Michael Brown', position: 'Manager', salary: 90000, location: 'Chicago', department: 'Management', hireDate: '2018-07-10', email: 'michael.brown@example.com', phone: '345-678-9012', status: 'Active', experience: 8, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.8, lastReview: '2025-07-01' },
  { id: 4, name: 'Emily Davis', position: 'Analyst', salary: 60000, location: 'San Francisco', department: 'Analytics', hireDate: '2021-02-18', email: 'emily.davis@example.com', phone: '456-789-0123', status: 'Active', experience: 3, team: 'Data', manager: 'David Lee', office: 'Branch B', performanceScore: 4.0, lastReview: '2025-04-20' },
  { id: 5, name: 'William Johnson', position: 'Engineer', salary: 80000, location: 'Remote', department: 'Engineering', hireDate: '2020-09-05', email: 'william.johnson@example.com', phone: '567-890-1234', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.7, lastReview: '2025-06-10' },
  { id: 6, name: 'Olivia Wilson', position: 'Developer', salary: 72000, location: 'Austin', department: 'Engineering', hireDate: '2021-11-30', email: 'olivia.wilson@example.com', phone: '678-901-2345', status: 'Active', experience: 4, team: 'Full Stack', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.3, lastReview: '2025-05-25' },
  { id: 7, name: 'James Taylor', position: 'Designer', salary: 67000, location: 'Remote', department: 'Design', hireDate: '2020-04-12', email: 'james.taylor@example.com', phone: '789-012-3456', status: 'Inactive', experience: 5, team: 'UI/UX', manager: 'Carol White', office: 'HQ', performanceScore: 3.9, lastReview: '2024-12-15' },
  { id: 8, name: 'Sophia Martinez', position: 'Analyst', salary: 62000, location: 'Boston', department: 'Analytics', hireDate: '2022-01-25', email: 'sophia.martinez@example.com', phone: '890-123-4567', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'Branch B', performanceScore: 4.1, lastReview: '2025-03-10' },
  { id: 9, name: 'Liam Anderson', position: 'Engineer', salary: 78000, location: 'Seattle', department: 'Engineering', hireDate: '2019-06-17', email: 'liam.anderson@example.com', phone: '901-234-5678', status: 'Active', experience: 7, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.6, lastReview: '2025-06-20' },
  { id: 10, name: 'Ava Thompson', position: 'Manager', salary: 95000, location: 'Remote', department: 'Management', hireDate: '2017-10-08', email: 'ava.thompson@example.com', phone: '012-345-6789', status: 'Active', experience: 9, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.9, lastReview: '2025-07-05' },
  { id: 11, name: 'Noah White', position: 'Developer', salary: 74000, location: 'Denver', department: 'Engineering', hireDate: '2021-03-14', email: 'noah.white@example.com', phone: '123-456-7891', status: 'Active', experience: 3, team: 'Frontend', manager: 'Bob Johnson', office: 'Branch A', performanceScore: 4.4, lastReview: '2025-05-30' },
  { id: 12, name: 'Isabella Lee', position: 'Designer', salary: 66000, location: 'Miami', department: 'Design', hireDate: '2020-08-20', email: 'isabella.lee@example.com', phone: '234-567-8902', status: 'Active', experience: 4, team: 'UI/UX', manager: 'Carol White', office: 'Branch B', performanceScore: 4.2, lastReview: '2025-04-25' },
  { id: 13, name: 'Ethan Harris', position: 'Analyst', salary: 61000, location: 'Remote', department: 'Analytics', hireDate: '2022-05-10', email: 'ethan.harris@example.com', phone: '345-678-9013', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'HQ', performanceScore: 4.0, lastReview: '2025-03-15' },
  { id: 14, name: 'Mia Clark', position: 'Engineer', salary: 79000, location: 'San Francisco', department: 'Engineering', hireDate: '2019-12-01', email: 'mia.clark@example.com', phone: '456-789-0124', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'Branch A', performanceScore: 4.5, lastReview: '2025-06-15' },
  { id: 15, name: 'Alexander Lewis', position: 'Manager', salary: 92000, location: 'Chicago', department: 'Management', hireDate: '2018-02-28', email: 'alexander.lewis@example.com', phone: '567-890-1235', status: 'Active', experience: 8, team: 'Leadership', manager: 'Carol White', office: 'HQ', performanceScore: 4.7, lastReview: '2025-07-10' },
  { id: 16, name: 'Charlotte Walker', position: 'Developer', salary: 73000, location: 'Remote', department: 'Engineering', hireDate: '2021-07-19', email: 'charlotte.walker@example.com', phone: '678-901-2346', status: 'Active', experience: 3, team: 'Full Stack', manager: 'Bob Johnson', office: 'Branch B', performanceScore: 4.3, lastReview: '2025-05-20' },
  { id: 17, name: 'Daniel Young', position: 'Designer', salary: 68000, location: 'Austin', department: 'Design', hireDate: '2020-11-05', email: 'daniel.young@example.com', phone: '789-012-3457', status: 'Active', experience: 5, team: 'UI/UX', manager: 'Carol White', office: 'HQ', performanceScore: 4.1, lastReview: '2025-04-30' },
  { id: 18, name: 'Amelia King', position: 'Analyst', salary: 63000, location: 'Boston', department: 'Analytics', hireDate: '2022-03-15', email: 'amelia.king@example.com', phone: '890-123-4568', status: 'Active', experience: 2, team: 'Data', manager: 'David Lee', office: 'Branch A', performanceScore: 4.0, lastReview: '2025-03-20' },
  { id: 19, name: 'Henry Scott', position: 'Engineer', salary: 77000, location: 'Seattle', department: 'Engineering', hireDate: '2019-09-25', email: 'henry.scott@example.com', phone: '901-234-5679', status: 'Active', experience: 6, team: 'Backend', manager: 'Alice Smith', office: 'HQ', performanceScore: 4.6, lastReview: '2025-06-25' },
  { id: 20, name: 'Evelyn Adams', position: 'Manager', salary: 94000, location: 'Remote', department: 'Management', hireDate: '2017-12-10', email: 'evelyn.adams@example.com', phone: '012-345-6790', status: 'Active', experience: 9, team: 'Leadership', manager: 'Carol White', office: 'Branch B', performanceScore: 4.8, lastReview: '2025-07-15' },
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