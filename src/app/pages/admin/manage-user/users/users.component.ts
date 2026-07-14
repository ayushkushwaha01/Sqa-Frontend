import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ManageUsersService } from '../manage-users.service';
import { AlertService } from 'src/app/shared/alert.service'; // Make sure this path is correct!
import { ManagerDialogComponent } from './manager-dialog/manager-dialog.component';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

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
    private api: ManageUsersService,
    private alertService: AlertService
  ) {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: ['']
    });
  }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => this.alertService.createAlert('Error fetching users', 0)
    });
  }

  openEditDialog(item: any = null) {
    let dialogRef = this.dialog.open(EditUserComponent, {
      data: item,
      height: 'auto',
      width: '850px'
    });
    
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.getAllUsers();
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
        this.api.toggleUserStatus(item).subscribe({
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

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });
    
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteUser(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getAllUsers();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }

  getManagerCount(managerStr: string): number {
    if (!managerStr) return 0;
    return managerStr.split(',').filter(x => x).length;
  }

  openManagersDialog(managerStr: string) {
    if (!managerStr) return; // Do nothing if 0 managers
    
    this.dialog.open(ManagerDialogComponent, {
      data: managerStr, // Pass the "1,4" string to the popup
      width: '350px'
    });
  }

  openResetPassword(item: any) {
    this.dialog.open(ResetPasswordDialogComponent, {
      data: item, // Pass the whole user so we have the UserId
      width: '550px'
    });
  }
}