import { Component } from '@angular/core';
import { TableSortEvent } from 'projects/ui-lib/src/lib/components/display/data-table/base-table/sortable-table.directive';
import { PaginationEvent } from 'projects/ui-lib/src/lib/components/display/pagination/pagination.component';
import { ColumnGroup, DataTableComponent, TableActionEvent, TableStateEvent } from 'projects/ui-lib/src/public-api';

@Component({
  selector: 'app-data-table-demo',
  imports: [
    DataTableComponent,
  ],
  templateUrl: './data-table-demo.html',
  styleUrl: './data-table-demo.css'
})
export class DataTableDemo {
tableData = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
      { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'Active', createdAt: '2023-10-01T10:00:00Z', phone: '123-456-7890', role: 'Admin', lastLogin: '2023-10-05T08:00:00Z', department: 'IT', location: 'New York', age: 30, salary: 75000, projects: 5, performance: 'Excellent', hireDate: '2022-01-15T09:00:00Z', manager: 'Alice Johnson', teamSize: 10, verified: true, lastUpdated: '2023-10-04T12:00:00Z', notes: 'Top performer', rating: 4.5, bonus: 5000, employmentType: 'Full-time', country: 'USA', skills: ['JavaScript', 'Python'], avatar: 'icons/avatar1.svg', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive', createdAt: '2023-10-02T12:00:00Z', phone: '234-567-8901', role: 'Developer', lastLogin: '2023-09-30T10:00:00Z', department: 'Engineering', location: 'San Francisco', age: 28, salary: 65000, projects: 3, performance: 'Good', hireDate: '2022-03-10T09:00:00Z', manager: 'Bob Brown', teamSize: 8, verified: false, lastUpdated: '2023-10-03T14:00:00Z', notes: 'Needs improvement', rating: 3.8, bonus: 3000, employmentType: 'Part-time', country: 'USA', skills: ['React', 'Node.js'], avatar: 'icons/avatar2.svg', active: false },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', status: 'Active', createdAt: '2023-10-03T14:00:00Z', phone: '345-678-9012', role: 'Manager', lastLogin: '2023-10-04T15:00:00Z', department: 'Management', location: 'Chicago', age: 35, salary: 85000, projects: 7, performance: 'Outstanding', hireDate: '2021-06-20T09:00:00Z', manager: 'N/A', teamSize: 15, verified: true, lastUpdated: '2023-10-04T16:00:00Z', notes: 'Great leader', rating: 4.8, bonus: 7000, employmentType: 'Full-time', country: 'USA', skills: ['Leadership', 'Strategy'], avatar: 'icons/avatar3.svg', active: true },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', status: 'Pending', createdAt: '2023-10-04T16:00:00Z', phone: '456-789-0123', role: 'Analyst', lastLogin: '2023-10-01T11:00:00Z', department: 'Analytics', location: 'Boston', age: 32, salary: 70000, projects: 4, performance: 'Satisfactory', hireDate: '2022-02-01T09:00:00Z', manager: 'Alice Johnson', teamSize: 6, verified: false, lastUpdated: '2023-10-04T17:00:00Z', notes: 'Consistent performer', rating: 4.0, bonus: 4000, employmentType: 'Contract', country: 'USA', skills: ['SQL', 'Excel'], avatar: 'icons/avatar4.svg', active: false },
    
];

// Total count for pagination
totalItems = this.tableData.length;

// Column group configuration with 21 columns
columnGroups: ColumnGroup[] = [
    {
        title: 'User Information',
        columns: [
            
            {
                title: 'Name',
                key: 'name',
                type: 'text',
                sortKey: 'name',
                alignment: 'center',
                                pinned: 'left',

                visible: true,
                textConfig: { textColorClass: 'text-gray-800' },
                // filterConfig: {
                //     type: 'text',
                //     placeholder: 'Filter by name...',
                //     operation: 'contains'
                // }
            },
            {
                title: 'Email',
                key: 'email',
                type: 'text',
                alignment: 'left',
                visible: true,
                textConfig: { textColorClass: 'text-blue-600' }
            },
            {
                title: 'Phone',
                key: 'phone',
                type: 'text',
                alignment: 'left',
                visible: true
            }
        ]
    },
    {
        title: 'Employment Details',
        columns: [
            {
                title: 'Role',
                key: 'role',
                type: 'text',
                alignment: 'left',
                visible: true
            },
            {
                title: 'Department',
                key: 'department',
                type: 'text',
                alignment: 'left',
                visible: true
            },
            {
                title: 'Employment Type',
                key: 'employmentType',
                type: 'badge',
                alignment: 'center',
                visible: true,
                badgeConfig: {
                    properties: [
                        { data: 'Full-time', displayText: 'Full-time', backgroundColorClass: 'bg-blue-100', textColorClass: 'text-blue-800' },
                        { data: 'Part-time', displayText: 'Part-time', backgroundColorClass: 'bg-purple-100', textColorClass: 'text-purple-800' },
                        { data: 'Contract', displayText: 'Contract', backgroundColorClass: 'bg-gray-100', textColorClass: 'text-gray-800' }
                    ]
                }
            },
            {
                title: 'Hire Date',
                key: 'hireDate',
                type: 'date',
                alignment: 'right',
                visible: true,
                dateConfig: {
                    dateFormat: 'MMM d, y',
                    showIcon: true
                }
            },
            {
                title: 'Manager',
                key: 'manager',
                type: 'text',
                alignment: 'left',
                visible: true
            }
        ]
    },
    {
        title: 'Performance Metrics',
        columns: [
            {
                title: 'Status',
                key: 'status',
                type: 'badge',
                alignment: 'center',
                visible: true,
                badgeConfig: {
                    properties: [
                        { data: 'Active', displayText: 'Active', backgroundColorClass: 'bg-green-100', textColorClass: 'text-green-800', indicatorColorClass: 'bg-green-500' },
                        { data: 'Inactive', displayText: 'Inactive', backgroundColorClass: 'bg-red-100', textColorClass: 'text-red-800', indicatorColorClass: 'bg-red-500' },
                        { data: 'Pending', displayText: 'Pending', backgroundColorClass: 'bg-yellow-100', textColorClass: 'text-yellow-800', indicatorColorClass: 'bg-yellow-500' }
                    ]
                },
                // filterConfig: {
                //     type: 'select',
                //     placeholder: 'Filter by status...',
                //     options: [
                //         { value: 'Active', label: 'Active' },
                //         { value: 'Inactive', label: 'Inactive' },
                //         { value: 'Pending', label: 'Pending' }
                //     ]
                // }
            },
            {
                title: 'Performance',
                key: 'performance',
                type: 'text',
                alignment: 'center',
                visible: true,
                propertyStyle: (value: string) => ({
                    'font-weight': value === 'Outstanding' || value === 'Excellent' ? 'bold' : 'normal'
                })
            },
            {
                title: 'Rating',
                key: 'rating',
                type: 'text',
                alignment: 'right',
                visible: true,
                formatter: (value: number) => value.toFixed(1)
            },
            {
                title: 'Projects',
                key: 'projects',
                type: 'text',
                alignment: 'right',
                visible: true
            },
            {
                title: 'Bonus',
                key: 'bonus',
                type: 'text',
                alignment: 'right',
                visible: true,
                formatter: (value: number) => `$${value.toLocaleString()}`
            }
        ]
    },
    {
        title: 'Additional Information',
        columns: [
            {
                title: 'Location',
                key: 'location',
                type: 'text',
                alignment: 'left',
                visible: true
            },
            {
                title: 'Country',
                key: 'country',
                type: 'text',
                alignment: 'left',
                visible: true
            },
            {
                title: 'Age',
                key: 'age',
                type: 'text',
                alignment: 'right',
                visible: true
            },
            {
                title: 'Salary',
                key: 'salary',
                type: 'text',
                alignment: 'right',
                visible: true,
                formatter: (value: number) => `$${value.toLocaleString()}`
            },
            {
                title: 'Verified',
                key: 'verified',
                type: 'custom',
                alignment: 'center',
                visible: true,
                customConfig: {
                    data: (item: any) => ({
                        text: item.verified ? 'Yes' : 'No',
                        class: item.verified ? 'text-green-600' : 'text-red-600'
                    })
                }
            },
            {
                title: 'Skills',
                key: 'skills',
                type: 'text',
                alignment: 'left',
                visible: true,
                formatter: (value: string[]) => value.join(', ')
            }
        ]
    },
    {
        title: 'Activity',
        columns: [
            {
                title: 'Last Login',
                key: 'lastLogin',
                type: 'date',
                alignment: 'right',
                visible: true,
                dateConfig: {
                    dateFormat: 'MMM d, y, h:mm a',
                    showIcon: true
                }
            },
            {
                title: 'Last Updated',
                key: 'lastUpdated',
                type: 'date',
                alignment: 'right',
                visible: true,
                dateConfig: {
                    dateFormat: 'MMM d, y, h:mm a',
                    showIcon: true
                }
            },
            {
                title: 'Notes',
                key: 'notes',
                type: 'text',
                alignment: 'left',
                visible: true,
                textConfig: { textColorClass: 'text-gray-600' }
            }
        ]
    },
    {
        title: 'Actions',
        columns: [
            {
                title: 'Actions',
                type: 'actions',
                alignment: 'right',
                visible: true,
                pinned: 'right',
                actionsConfig: {
                    iconActions: [
                        { iconPath: 'icons/edit.svg', actionKey: 'edit', label: 'Edit' },
                        { iconPath: 'icons/delete.svg', actionKey: 'delete', label: 'Delete' }
                    ],
                    threeDotMenuActions: (item: any) => [
                        { actionKey: 'view', label: 'View Details', iconPath: 'icons/view.svg' },
                        { actionKey: 'archive', label: item.verified ? 'Archive' : 'Unarchive', iconPath: 'icons/archive.svg' }
                    ]
                }
            }
        ]
    }
];
  // Optional: Default selected rows
  defaultSelectedKeys = []; // Select rows with IDs 1 and 3 by default

  // Handlers for table events
  onPageChange(event: PaginationEvent) {
    console.log('Page changed:', event);
    // In a real app, you might slice the tableData based on pageNumber and pageSize
  }

  onSortChanged(event: TableSortEvent) {
    console.log('Sort changed:', event);
    // In a real app, you might sort tableData based on event.key and event.direction
  }

  onTableStateChanged(event: TableStateEvent) {
    console.log('Table state changed:', event);
    // Handle search, filters, or pagination changes
  }

  onActionPerformed(event: TableActionEvent) {
    console.log('Action performed:', event);
    // Handle actions like edit, delete, or view
    if (event.actionKey === 'edit') {
      console.log(`Editing item with ID ${event.item.id}`);
    } else if (event.actionKey === 'delete') {
      console.log(`Deleting item with ID ${event.item.id}`);
    } else if (event.actionKey === 'view') {
      console.log(`Viewing details of item with ID ${event.item.id}`);
    }
  }

  onRowClicked(item: any) {
    console.log('Row clicked:', item);
  }

  onRowSelectionChange(selectedIds: any[]) {
    console.log('Selected IDs:', selectedIds);
  }
}
