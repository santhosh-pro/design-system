import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColumnDef, MultiSelectDataTableField } from 'projects/ui-lib/src/public-api';

// Sample data interfaces
interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
}

@Component({
  selector: 'app-sample-parent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectDataTableField
],
  templateUrl: './data-table-picker-demo.html',
})
export class DataTablePickerDemo {
  // Sample data
  users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', role: 'Senior Developer', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Marketing', role: 'Marketing Manager', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Engineering', role: 'DevOps Engineer', status: 'active' },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', department: 'Design', role: 'UX Designer', status: 'inactive' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie.wilson@company.com', department: 'Sales', role: 'Sales Representative', status: 'active' },
    { id: 6, name: 'Diana Davis', email: 'diana.davis@company.com', department: 'HR', role: 'HR Specialist', status: 'active' },
    { id: 7, name: 'Edward Miller', email: 'edward.miller@company.com', department: 'Engineering', role: 'Frontend Developer', status: 'active' },
    { id: 8, name: 'Fiona Garcia', email: 'fiona.garcia@company.com', department: 'Marketing', role: 'Content Writer', status: 'inactive' },
  ]);

  departments = signal<Department[]>([
    { id: 'eng', name: 'Engineering', code: 'ENG', manager: 'John Doe' },
    { id: 'mkt', name: 'Marketing', code: 'MKT', manager: 'Jane Smith' },
    { id: 'des', name: 'Design', code: 'DES', manager: 'Alice Brown' },
    { id: 'sal', name: 'Sales', code: 'SAL', manager: 'Charlie Wilson' },
    { id: 'hr', name: 'Human Resources', code: 'HR', manager: 'Diana Davis' },
    { id: 'fin', name: 'Finance', code: 'FIN', manager: 'Robert Lee' },
  ]);

  // Column definitions
  userColumns = signal<ColumnDef[]>([
    {
      key: 'name',
      title: 'Name',
      type: 'text',
      alignment: 'left',
      sortKey: 'name',
      visible: true
    },
    {
      key: 'email',
      title: 'Email',
      type: 'text',
      alignment: 'left',
      sortKey: 'email',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search email...',
        operation: 'contains'
      }
    },
    {
      key: 'department',
      title: 'Department',
      type: 'text',
      alignment: 'left',
      sortKey: 'department',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search department...',
        operation: 'contains'
      }
    },
    {
      key: 'role',
      title: 'Role',
      type: 'text',
      alignment: 'left',
      sortKey: 'role',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search role...',
        operation: 'contains'
      }
    },
    {
      key: 'status',
      title: 'Status',
      type: 'text',
      alignment: 'center',
      sortKey: 'status',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search status...',
      },
    },
  ]);

  departmentColumns = signal<ColumnDef[]>([
    {
      title: 'Department Name',
      key: 'name',
      type: 'text',
      alignment: 'left',
      sortKey: 'name',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search department name...',
        operation: 'contains'
      },
      width: 200
    },
    {
      title: 'Code',
      key: 'code',
      type: 'text',
      alignment: 'center',
      sortKey: 'code',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search by code...',
        operation: 'contains'
      },
      width: 100,
      textConfig: {
        textColorClass: 'text-blue-600 font-mono'
      }
    },
    {
      title: 'Manager',
      key: 'manager',
      type: 'text',
      alignment: 'left',
      sortKey: 'manager',
      visible: true,
      filterConfig: {
        type: 'text',
        placeholder: 'Search by manager...',
        operation: 'contains'
      },
      width: 180
    },
  ]);

  // Form setup
  demoForm = new FormGroup({
    selectedUsers: new FormControl<number[]>([], [Validators.required]),
    selectedDepartments: new FormControl<string[]>([]),
  });

  // Computed values for selected counts
  selectedUsersCount = signal<number>(0);
  selectedDepartmentsCount = signal<number>(0);

  constructor() {
    // Initialize counters
    this.updateSelectionCounts();
    
    // Watch for form value changes
    this.demoForm.valueChanges.subscribe(() => {
      this.updateSelectionCounts();
    });
  }

  private updateSelectionCounts(): void {
    const users = this.demoForm.get('selectedUsers')?.value || [];
    const departments = this.demoForm.get('selectedDepartments')?.value || [];
    
    this.selectedUsersCount.set(users.length);
    this.selectedDepartmentsCount.set(departments.length);
  }

  onUsersChanged(selectedUserIds: number[]): void {
    console.log('Users selection changed:', selectedUserIds);
    // You can add custom logic here when users are selected/deselected
    
    // Example: Get full user objects
    const selectedUsers = this.users().filter(user => selectedUserIds.includes(user.id));
    console.log('Selected user objects:', selectedUsers);
  }

  onDepartmentsChanged(selectedDepartmentIds: string[]): void {
    console.log('Departments selection changed:', selectedDepartmentIds);
    // You can add custom logic here when departments are selected/deselected
    
    // Example: Get full department objects
    const selectedDepartments = this.departments().filter(dept => selectedDepartmentIds.includes(dept.id));
    console.log('Selected department objects:', selectedDepartments);
  }

  onDepartmentTableStateChanged(state: any): void {
    console.log('Department table state changed:', state);
    // Handle table state changes like sorting, filtering, pagination here if needed
  }

  loadSampleSelections(): void {
    // Load some sample selections
    this.demoForm.patchValue({
      selectedUsers: [1, 3, 7], // John Doe, Bob Johnson, Edward Miller
      selectedDepartments: ['eng', 'mkt'], // Engineering, Marketing
    });
  }

  clearAllSelections(): void {
    this.demoForm.patchValue({
      selectedUsers: [],
      selectedDepartments: [],
    });
  }

  onSubmit(): void {
    if (this.demoForm.valid) {
      const formData = this.demoForm.value;
      console.log('Form submitted:', formData);
      
      // Here you would typically send the data to a service
      // this.dataService.saveSelections(formData);
      
      alert('Form submitted successfully! Check the console for details.');
    } else {
      console.log('Form is invalid');
      this.demoForm.markAllAsTouched();
    }
  }

  getFormValues(): any {
    return this.demoForm.value;
  }
}