import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card';
import { DocIoList } from '../core/doc-io-list/doc-io-list';
import { ColumnDef, ColumnNode, DataTableComponent, TableActionEvent, TableStateEvent } from 'projects/ui-lib/src/public-api';
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



  // Column definitions for all variants
  basicColumns = signal<ColumnDef[]>([
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
  ]);

  selectionColumns = signal<ColumnDef[]>([
    { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
    { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
    { title: 'Role', key: 'role', type: 'text', alignment: 'center', sortKey: 'role' },
    { title: 'Department', key: 'department', type: 'text', alignment: 'left', sortKey: 'department' },
  ]);

  actionColumns = signal<ColumnDef[]>([
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
  ]);


  // Form controls for table state
  basicControl = new FormControl<TableStateEvent>({ searchText: '' });
  nestedColumns = signal<ColumnNode[]>([
    {
      title: 'User Info',
      alignment: 'right',
      children: [
        { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id', },
        {
          title: 'Personal Details',
          children: [
            {
              title: 'Name',
              key: 'name',
              type: 'text',
              alignment: 'left',
              sortKey: 'name',
            },
            {
              title: 'Email',
              key: 'email',
              type: 'text',
              alignment: 'left',
              sortKey: 'email',
            },
          ]
        },
      ]
    },
    {
      title: 'Status Info',
      children: [
        {
          title: 'Age',
          key: 'age',
          type: 'text',
          alignment: 'center',
          sortKey: 'age',
        },
        {
          title: 'Status',
          key: 'status',
          type: 'badge',
          sortKey: 'status',
          badgeConfig: {
            properties: [
              { data: 'Active', displayText: 'Active', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800' },
              { data: 'Inactive', displayText: 'Inactive', backgroundColorClass: 'bg-red-100', textColorClass: 'text-red-800' },
            ],
          },
        },
      ]
    },
    {
      title: 'Employment',
      children: [
        {
          title: 'Joined Date',
          key: 'joined',
          type: 'date',
          sortKey: 'joined',
          alignment: 'center',
          dateConfig: { dateFormat: 'MMM d, y', showIcon: true },
        },
        {
          title: 'Department',
          key: 'department',
          type: 'text',
          sortKey: 'department',
          alignment: 'left',
        },
      ]
    },
    {
      title: 'Actions',
      type: 'actions',
      pinned: 'right',
      actionsConfig: {
        iconActions: [
          { iconPath: 'edit.svg', actionKey: 'edit', label: 'Edit' },
          { iconPath: 'delete.svg', actionKey: 'delete', label: 'Delete' }
        ],
        threeDotMenuActions: [
          { label: 'View Details', actionKey: 'view' },
          { label: 'Archive', actionKey: 'archive' }
        ]
      }
    }
  ]);

  // Demo files for code viewer
  basicFiles = signal<DemoFile[]>([
    {
      name: 'basic-demo.component.html',
      language: 'html',
      code: `<app-data-table
  [columns]="basicColumns()"
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
      code: `import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColumnDef, TableStateEvent } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-basic-demo',
  templateUrl: './basic-demo.component.html',
})
export class BasicDemoComponent {
  basicControl = new FormControl<TableStateEvent>({ searchText: '' });
  basicData = signal<any[]>([
    { id: 1, name: 'User 1', age: 30, status: 'Active', email: 'user1@example.com' },
    // ... more data
  ]);
  basicColumns = signal<ColumnDef[]>([
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
  ]);

  onTableStateChanged(event: TableStateEvent) {
    console.log('Table state changed:', event);
  }
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