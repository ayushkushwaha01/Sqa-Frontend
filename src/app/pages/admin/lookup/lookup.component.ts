import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { AddLookupDialogComponent } from './add-lookup-dialog/add-lookup-dialog.component';
import { LookupService } from './lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { AlertService } from 'src/app/shared/alert.service';
import { UserPermissionService } from '../../helpers/user-permission.service';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {
  tableData: any[] = [];
  filteredData: any[] = [];
  pagedData: any[] = [];
  codeMasters: any[] = [];
  selectedCodeFilter: number | null = null;

  pageIndex: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  canCreate: boolean = false;
  canUpdate: boolean = false;
  canDelete: boolean = false;
  canRead: boolean = false;
  readonly SCREEN_ID: number = 6;

  constructor(
    public dialog: MatDialog,
    private api: LookupService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    this.canCreate = UserPermissionService.fnGetCreatePermissions(this.SCREEN_ID);
    this.canUpdate = UserPermissionService.fnGetUpdatePermissions(this.SCREEN_ID);
    this.canDelete = UserPermissionService.fnGetDeletePermissions(this.SCREEN_ID);
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }

    this.getCodeMasters();
    this.getLookups();
  }

  getCodeMasters() {
    this.api.getCodeMasters().subscribe((res: any) => {
      if (res.success) this.codeMasters = res.data;
    });
  }

  getLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.tableData = (res.data || []).sort((a: any, b: any) => (b.lookupId || 0) - (a.lookupId || 0));
        this.filterTable(); // Apply initial filter if any
      }
    });
  }

  refresh() {
    this.selectedCodeFilter = null;
    this.pageIndex = 0;
    this.getLookups();
  }

  filterTable() {
    if (this.selectedCodeFilter) {
      this.filteredData = this.tableData.filter(x => x.codeId === this.selectedCodeFilter);
    } else {
      this.filteredData = [...this.tableData];
    }
    this.pageIndex = 0;
    this.updatePage();
  }

  updatePage() {
    const maxPageIndex = Math.max(0, Math.ceil(this.filteredData.length / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.filteredData.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  addlookup(item: any) {
    let dialogRef = this.dialog.open(AddLookupDialogComponent, {
      data: { item: item, codeMasters: this.codeMasters },
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => { if (res) this.getLookups(); });
  }

  toggleStatus(item: any) {
    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.toggleStatus(item.lookupId).subscribe({
          next: (res: any) => {
            if (res.success) {
              item.isActive = !item.isActive;
              this.alertService.createAlert(res.message || 'Status updated successfully.', 1);
            } else {
              this.alertService.createAlert(res.message || 'Failed to update status.', 0);
            }
          }
        });
      }
    });
  }

  deleteLookup(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this lookup?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteLookup(item.lookupId).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Lookup deleted successfully.', 1);
              this.getLookups();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete lookup.', 0);
            }
          }
        });
      }
    });
  }
}