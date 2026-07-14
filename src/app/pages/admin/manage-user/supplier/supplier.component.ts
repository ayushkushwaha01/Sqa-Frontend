import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { ManageUsersService } from '../manage-users.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/alert.service';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { SupplierResetPasswordComponent } from './supplier-reset-password/supplier-reset-password.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html'
})
export class SupplierComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;
  allData: any[] = [];
  Status = [{ name: 'Active', value: true }, { name: 'Inactive', value: false }];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({ Keyword: [''], Status: [''] });
  }

  ngOnInit(): void { this.loadSuppliers(); }

  loadSuppliers() {
    this.api.getSuppliers().subscribe((res: any) => {
      if (res.success) {
        this.allData = res.data;
        this.dataSource.data = this.allData;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  openAddSupplier(item: any = null) {
    let dialogRef = this.dialog.open(AddSupplierComponent, {
      data: item,
      width: '850px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => { if (res) this.loadSuppliers(); });
  }

  deleteSupplier(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteSupplier(item.supplierId).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.loadSuppliers();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  toggleStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleSupplierStatus(item.supplierId).subscribe({
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

  resetPassword(item: any) {
    this.dialog.open(SupplierResetPasswordComponent, {
      data: item,
      width: '550px'
    });
  }

  filter() {
    const keyword = this.filterForm.value.Keyword?.toLowerCase() || '';
    const status = this.filterForm.value.Status;

    let filtered = this.allData.filter(item =>
      (item.supplierName.toLowerCase().includes(keyword) ||
       item.email.toLowerCase().includes(keyword) ||
       item.userName.toLowerCase().includes(keyword))
    );

    if (status !== '' && status !== null) {
      filtered = filtered.filter(item => item.isActive === status);
    }
    this.dataSource.data = filtered;
  }

  clearFilter() {
    this.filterForm.reset();
    this.dataSource.data = this.allData;
  }
}