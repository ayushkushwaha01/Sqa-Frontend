
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'src/app/shared/alert.service';

import { AddRolesComponent } from './add-roles/add-roles.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ManageUsersService } from '../manage-users.service'; 
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// 🔥 1. Import Permission Service
import { UserPermissionService } from 'src/app/pages/helpers/user-permission.service'; 

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  // 🔥 2. Permission Variables (Screen ID 2 = Roles)
  canRead: boolean = false;
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  readonly SCREEN_ID: number = 2;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  filterForm!: FormGroup;
  filterToggle = false;

  Status = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
  ];

  defaultModules = [
    {
      name: 'Admin & Dashboard',
      screens: [
        { screenName: 'Dashboard', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Roles', create: true, read: true, update: true, delete: true },
        { screenName: 'Users', create: true, read: true, update: true, delete: true },
        { screenName: 'Suppliers', create: true, read: true, update: true, delete: true },
        { screenName: 'Departments', create: true, read: true, update: true, delete: true },
        { screenName: 'Lookup Options', create: true, read: true, update: true, delete: true },
        { screenName: 'Preferences', create: '-', read: true, update: false, delete: '-' },
        { screenName: 'Event Log', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Escalation Matrix', create: '-', read: true, update: false, delete: '-' }
      ]
    },
    {
      name: 'Process Audits',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'New Audit', create: true, read: '-', update: '-', delete: '-' },
        { screenName: 'Active Audits', create: true, read: true, update: true, delete: true },
        { screenName: 'Active Audits >> Active Audit Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'Completed Audits', create: '-', read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'User Manual', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Help Desk', create: true, read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Parts Audits',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'New Audit', create: true, read: '-', update: '-', delete: '-' },
        { screenName: 'Active Audits', create: true, read: true, update: true, delete: true },
        { screenName: 'Active Audits >> Parts Audit Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'Completed Audits', create: '-', read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'User Manual', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Help Desk', create: true, read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Inspection',
      screens: [
        { screenName: 'Analytics', create: '-', read: true, update: '-', delete: '-' },
        { screenName: 'Records', create: true, read: true, update: true, delete: true },
        { screenName: 'Records >> Inspection Dashboard', create: true, read: true, update: true, delete: '-' },
        { screenName: 'CAPA', create: true, read: true, update: true, delete: true },
        { screenName: 'Archives', create: '-', read: true, update: true, delete: '-' }
      ]
    },
    {
      name: 'Setup',
      screens: [
        { screenName: 'Process Audit Categories', create: true, read: true, update: true, delete: true },
        { screenName: 'Commodity Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Audit Categories', create: true, read: true, update: true, delete: true },
        { screenName: 'Parts Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Parts Families', create: true, read: true, update: true, delete: true },
        { screenName: 'Defects Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Demerit Master', create: true, read: true, update: true, delete: true },
        { screenName: 'Supplier Master', create: true, read: true, update: true, delete: true }
      ]
    }
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private api: ManageUsersService, 
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // 🔥 3. Load Permissions
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);

    // 🔥 4. Block data load if they cannot read
    if (!this.canRead) return;

    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

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

  // Pre-existing lock to prevent anyone from modifying the Master Admin Role
  isActionDisabled(roleName: string): boolean {
    return roleName === 'Admin';
  }

  calculateCheckboxCounts(modules: any[]): { checked: number; total: number } {
    let total = 0;
    let checked = 0;

    if (!modules || !Array.isArray(modules)) {
      return { checked: 0, total: 0 };
    }

    modules.forEach((mod: any) => {
      const screens = mod.screens || mod.Screens || [];
      screens.forEach((screen: any) => {
        // --- 1. CREATE ---
        let hasCreate = false;
        let isCreateChecked = false;
        if (screen.hasCreate !== undefined) {
          hasCreate = Boolean(screen.hasCreate);
          isCreateChecked = Boolean(screen.canCreate);
        } else if (screen.create !== undefined) {
          hasCreate = screen.create !== '-';
          isCreateChecked = screen.create === true;
        }
        if (hasCreate) {
          total++;
          if (isCreateChecked) checked++;
        }

        // --- 2. READ ---
        let hasRead = false;
        let isReadChecked = false;
        if (screen.hasRead !== undefined) {
          hasRead = Boolean(screen.hasRead);
          isReadChecked = Boolean(screen.canRead);
        } else if (screen.read !== undefined) {
          hasRead = screen.read !== '-';
          isReadChecked = screen.read === true;
        }
        if (hasRead) {
          total++;
          if (isReadChecked) checked++;
        }

        // --- 3. UPDATE ---
        let hasUpdate = false;
        let isUpdateChecked = false;
        if (screen.hasUpdate !== undefined) {
          hasUpdate = Boolean(screen.hasUpdate);
          isUpdateChecked = Boolean(screen.canUpdate);
        } else if (screen.update !== undefined) {
          hasUpdate = screen.update !== '-';
          isUpdateChecked = screen.update === true;
        }
        if (hasUpdate) {
          total++;
          if (isUpdateChecked) checked++;
        }

        // --- 4. DELETE ---
        let hasDelete = false;
        let isDeleteChecked = false;
        if (screen.hasDelete !== undefined) {
          hasDelete = Boolean(screen.hasDelete);
          isDeleteChecked = Boolean(screen.canDelete);
        } else if (screen.delete !== undefined) {
          hasDelete = screen.delete !== '-';
          isDeleteChecked = screen.delete === true;
        }
        if (hasDelete) {
          total++;
          if (isDeleteChecked) checked++;
        }
      });
    });

    return { checked, total };
  }

  // 1. GET DATA
  getAllData() {
    this.api.getAllRoles().subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          const roles = res.data;

          if (roles.length === 0) {
            this.dataSource.data = [];
            if (this.paginator) this.paginator.firstPage();
            return;
          }

          const requests = roles.map((role: any) => {
            if (role.modules && Array.isArray(role.modules)) {
              return of({ success: true, data: role.modules });
            }
            const roleId = role.roleId || role.id;
            return this.api.getRolePermissions(roleId).pipe(
              catchError(() => of({ success: false, data: [] }))
            );
          });

          forkJoin(requests).subscribe({
            next: (permResults: any[]) => {
              roles.forEach((role: any, index: number) => {
                const permRes = permResults[index];
                const modules = (permRes && (permRes.data || permRes.Data) && (permRes.data || permRes.Data).length > 0)
                  ? (permRes.data || permRes.Data)
                  : this.defaultModules;

                const { checked, total } = this.calculateCheckboxCounts(modules);
                role.screenPermissions = `${checked}/${total}`;
              });

              this.dataSource.data = roles;
              if (this.paginator) this.paginator.firstPage();
            },
            error: () => {
              this.dataSource.data = roles;
              if (this.paginator) this.paginator.firstPage();
            }
          });
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
    // 🔥 Protection Guard
    if (!item && !this.canCreate) return; 
    if (item && !this.canUpdate) return; 

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
    // 🔥 Protection Guard
    if (!this.canDelete || this.isActionDisabled(item.roleName)) return;

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
    // 🔥 Protection Guard
    if (!this.canUpdate || this.isActionDisabled(item.roleName)) return;

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