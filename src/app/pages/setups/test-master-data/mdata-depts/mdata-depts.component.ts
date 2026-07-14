import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAgencyAuditComponent } from '../../audit-config/a-agencies/add-agency-audit/add-agency-audit.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusConfirmationDialogComponent } from 'src/app/pages/testing/testing-projects/add-projects/status-confirmation-dialog/status-confirmation-dialog.component';
import { DepartmentService } from './department.service';

@Component({
  selector: 'app-mdata-depts',
  templateUrl: './mdata-depts.component.html',
  styleUrls: ['./mdata-depts.component.scss']
})
export class MdataDeptsComponent implements OnInit {
  // Data Lists
  allDepartments: any[] = []; // Holds the original unfiltered data
  filteredDepartments: any[] = []; // Holds data after applying filters
  tableList: any[] = []; // Holds data for the current page
  uniqueDeptCodes: string[] = []; // For the Department Code dropdown

  filterToggle: boolean = false;
  
  // Filter Models
  filterKeyword: string = '';
  filterStatus: boolean | null = null;
  filterDeptCodes: string[] = [];

  // Pagination Variables
  totalSize: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;

  // Example permissions
  canCreate = true;
  canUpdate = true;
  canDelete = true;

  constructor(
    private dialog: MatDialog,
    private departmentService: DepartmentService
  ) { }

  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments() {
    this.departmentService.getAllDepartments().subscribe((response: any) => {
      if (response && response.success) {
        this.allDepartments = response.data;
        
        // Extract unique department codes for the filter dropdown
        this.uniqueDeptCodes = [...new Set(this.allDepartments.map(item => item.departmentCode))].filter(Boolean);
        
        // Apply filters initially to load the grid and pagination
        this.applyFilters();
      }
    });
  }

  // --- FILTER LOGIC ---
  applyFilters() {
    this.filteredDepartments = this.allDepartments.filter(item => {
      // 1. Keyword Filter (Checks Name, Code, and Head)
      let matchesKeyword = true;
      if (this.filterKeyword) {
        const keyword = this.filterKeyword.toLowerCase();
        matchesKeyword = (
          (item.departmentName?.toLowerCase().includes(keyword)) ||
          (item.departmentCode?.toLowerCase().includes(keyword)) ||
          (item.departmentHead?.toLowerCase().includes(keyword))
        );
      }

      // 2. Status Filter
      let matchesStatus = true;
      if (this.filterStatus !== null && this.filterStatus !== undefined) {
        matchesStatus = item.isActive === this.filterStatus;
      }

      // 3. Department Code Filter (Multiple selection)
      let matchesCode = true;
      if (this.filterDeptCodes && this.filterDeptCodes.length > 0) {
        matchesCode = this.filterDeptCodes.includes(item.departmentCode);
      }

      return matchesKeyword && matchesStatus && matchesCode;
    });

    // Reset pagination to first page after search
    this.totalSize = this.filteredDepartments.length;
    this.currentPage = 0; 
    this.updatePagination();
  }

  clearFilters() {
    this.filterKeyword = '';
    this.filterStatus = null;
    this.filterDeptCodes = [];
    this.applyFilters();
  }

  // --- PAGINATION LOGIC ---
  handlePage(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.tableList = this.filteredDepartments.slice(startIndex, endIndex);
  }

  // --- CRUD OPERATIONS ---
  addmodule(item: any) {
    let dialogRef = this.dialog.open(AddAgencyAuditComponent, {
      data: item, 
      height: 'auto',
      width: '600px',
    });
    
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res === 'success') {
        this.getDepartments();
      }
    });
  }

  Confirmation(item: any) {
    let dialogRef = this.dialog.open(StatusConfirmationDialogComponent, {
      width: 'auto',
      data: { title: 'Change Status', content: `Are you sure you want to change the status of ${item.departmentName}?` }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        const payload = { departmentId: item.departmentId };
        this.departmentService.toggleDepartmentStatus(payload).subscribe((apiRes: any) => {
          if (apiRes.success) {
            this.getDepartments(); 
          }
        });
      }
    });
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { 
        title: 'Delete Confirmation', 
        content: `Are you sure you want to delete the department: ${item.departmentName}?` 
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) { 
        const payload = { departmentId: item.departmentId, deletedBy: 1 };
        
        this.departmentService.deleteDepartment(payload).subscribe((apiRes: any) => {
          if (apiRes.success) {
            this.getDepartments(); 
          } else {
            alert(apiRes.message || "Failed to delete department.");
          }
        });
      }
    });
  }
}