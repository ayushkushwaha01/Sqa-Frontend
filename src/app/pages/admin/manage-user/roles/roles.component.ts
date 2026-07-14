import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/alert.service';

import { AddRolesComponent } from './add-roles/add-roles.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ManageUsersService } from '../manage-users.service'; // Ensure this path is correct
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private api: ManageUsersService, // <-- Updated Service Injection
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.formInit();
    this.getAllData();
    this.setupFilterPredicate();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  formInit() {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  isActionDisabled(roleName: string): boolean {
    return roleName === 'Admin';
  }

  // 1. GET DATA
  getAllData() {
    this.api.getAllRoles().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataSource.data = res.data;
          if (this.paginator) this.paginator.firstPage();
        }
      },
      error: () => this.alertService.createAlert('Error fetching data', 0)
    });
  }

  // 2. FILTER LOGIC
  setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const search = JSON.parse(filter);
      
      const keyword = search.keyword.toLowerCase();
      const nameMatch = data.roleName?.toLowerCase().includes(keyword) || false;
      const keywordMatch = !keyword || nameMatch;

      const statusMatch = (search.status === '' || search.status === null) || 
                          (data.isActive === search.status);

      return keywordMatch && statusMatch;
    };
  }

  filter() {
    const filterValue = {
      keyword: this.filterForm.value.Keyword,
      status: this.filterForm.value.Status
    };
    this.dataSource.filter = JSON.stringify(filterValue);
  }

  clearFilter() {
    this.filterForm.reset({ Keyword: '', Status: '' });
    this.dataSource.filter = '';
  }

  // 3. ADD / EDIT DIALOG
  public openRoleDialog(item: any = null) {
    const dialogRef = this.dialog.open(AddRolesComponent, {
      width: '600px',
      maxWidth: '100vw',
      height: 'auto',
      data: item 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getAllData();
    });
  }

  // 4. DELETE
  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });
    
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.api.deleteRole(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getAllData();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  // 5. STATUS TOGGLE
  toggleStatus(item: any) {
    if(this.isActionDisabled(item.roleName)) return; 

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleStatus(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message, 1);
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }
}