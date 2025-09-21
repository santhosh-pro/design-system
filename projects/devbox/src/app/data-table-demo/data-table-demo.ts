import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DemoCard, DemoFile } from '../core/demo-card/demo-card';
import { DocIoList } from '../core/doc-io-list/doc-io-list';
import { CommonModule } from '@angular/common';
import { ExpandRowDemo } from './expand/expand-row-demo/expand-row-demo';
import { Button, DataTable, MultiDatePicker, TextField, Nav, Breadcrumb, MonthYearPicker, SideMenuItem, TopMenuItem, ColumnNode, ColumnDef, TableStateEvent, TableActionEvent } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-data-table-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Button, DataTable, DemoCard, DocIoList, MultiDatePicker, TextField, Nav, Breadcrumb, MonthYearPicker],
  templateUrl: './data-table-demo.html',
})
export class DataTableDemo {

  ExpandRowDemo=ExpandRowDemo;

  pageNumber = signal(2);

   menus = signal<SideMenuItem[]>([

    // {
    //   id: 'overview',
    //   label: 'Overview',
    //   link: '/overview',
    //   iconPath: 'icons/edit.svg',
    //   isEnabled: true
    // },
    {
      id: "ffgfg",
      isSeparator: true,
      isEnabled: true,
      groupHeading: "billing",
    },
    {
      id: "resource_cost",
      label: "Resource Cost",
      link: "/home",
      iconPath: "icons/resource.svg",
      isEnabled: true,
    },
    {
      id: "invoice",
      label: "Invoice",
      link: "/invoice",
      iconPath: "icons/invoice.svg",
      isEnabled: true,
    },
    {
      id: "separator1",
      isSeparator: true,
      isEnabled: true,
      groupHeading: "Marketplace",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      iconPath: "icons/marketplace.svg",
      externalLink:'https://marketplace.azure.com/marketplace/apps?search=',
      isEnabled: true,
    },
  ]);

  // settingsMenu = signal<SideMenuItem>({
  //   id: 'settings',
  //   label: 'Settings',
  //   link: '/settings',
  //   isEnabled: true,
  // });

  logoutMenu = signal<TopMenuItem>({
    id: "logout",
    label: "Logout",
    iconPath: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    isEnabled: true,
  });

   handleMenuClick(menu: SideMenuItem) {
    console.log("Menu clicked:", menu.label);
    // Implement navigation or other logic here
  }

  onClearFilters() {
    console.log("Clear filters clicked");
    this.filtersApplied.set(false);
  }

  onAddNew() {
    console.log("Add New clicked");
  }
  // Data for all variants
nestedColumns = signal<ColumnNode[]>([
  {
    title: 'User Info',
    alignment: 'center',
    children: [
      { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
      {
        title: 'Personal Details',
        alignment: 'center',
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
          {
            title: 'Phone',
            key: 'phone',
            type: 'custom',
            component: ExpandRowDemo,
            alignment: 'left',
            sortKey: 'phone',
          },
        ]
      },
    ]
  },
  {
    title: 'Status Info',
    children: [
      { title: 'Age', key: 'age', type: 'text', alignment: 'center', sortKey: 'age' },
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
      { title: 'Role', key: 'role', type: 'text', sortKey: 'role', alignment: 'left' },
      { title: 'Location', key: 'location', type: 'text', sortKey: 'location', alignment: 'left' },
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
      { title: 'Department', key: 'department', type: 'text', sortKey: 'department', alignment: 'center' },
      { title: 'Manager', key: 'manager', type: 'text', sortKey: 'manager', alignment: 'center' },
      { title: 'Salary', key: 'salary', type: 'text', sortKey: 'salary', alignment: 'center' },
    ]
  },
  {
    title: 'Other Details',
    children: [
      { title: 'Country', key: 'country', type: 'text', sortKey: 'country', alignment: 'left' },
      { title: 'City', key: 'city', type: 'text', sortKey: 'city', alignment: 'left' },
    ]
  },
  {
    title: 'Actions',
    type: 'actions',
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

// Data for 20 rows
nestedData = signal<any[]>(Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `+91-98765${1000 + i}`,
  age: 20 + (i % 30),
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  role: i % 3 === 0 ? 'Admin' : 'User',
  location: i % 2 === 0 ? 'Remote' : 'Onsite',
  joined: new Date(2020, i % 12, (i % 28) + 1),
  department: ['HR', 'Finance', 'Engineering', 'Sales'][i % 4],
  manager: `Manager ${Math.floor(i / 5) + 1}`,
  salary: 30000 + (i * 500),
  country: ['India', 'USA', 'UK', 'Canada'][i % 4],
  city: ['Delhi', 'New York', 'London', 'Toronto'][i % 4],
})));

// nestedData = signal<any[]>([]);




  // Column definitions for all variants
  basicColumns = signal<ColumnDef[]>([
    { title: 'ID', key: 'id', type: 'text', alignment: 'left', sortKey: 'id' },
    { title: 'Name', key: 'name', type: 'text', alignment: 'left', sortKey: 'name' },
    { title: 'Age', key: 'age', type: 'custom', component:ExpandRowDemo, alignment: 'center', sortKey: 'age' },
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
  filtersApplied = signal<boolean>(true);
 
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

  selectedRows: any[] = [];
  onRowSelectionChange(event: any[]) {
    console.log('Row selection changed:', event);
    this.selectedRows = event;
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

  onApplyFilters() {
    console.log('Apply filters clicked');
    this.filtersApplied.set(true);
  }
}