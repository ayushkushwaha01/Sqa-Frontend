import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddLookupDialogComponent } from './add-lookup-dialog/add-lookup-dialog.component';
import { LookupService } from './lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';
import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {
  tableData: any[] = [];
  filteredData: any[] = [];
  codeMasters: any[] = [];
  selectedCodeFilter: number | null = null;

  constructor(
    public dialog: MatDialog, 
    private api: LookupService, 
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.getCodeMasters();
    this.getLookups();
  }

  getCodeMasters() {
    this.api.getCodeMasters().subscribe((res: any) => {
      if(res.success) this.codeMasters = res.data;
    });
  }

  getLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if(res.success) {
        this.tableData = res.data;
        this.filterTable(); // Apply initial filter if any
      }
    });
  }

  refresh() {
    this.selectedCodeFilter = null;
    this.getLookups();
  }

  filterTable() {
    if (this.selectedCodeFilter) {
      this.filteredData = this.tableData.filter(x => x.codeId === this.selectedCodeFilter);
    } else {
      this.filteredData = this.tableData;
    }
  }

  addlookup(item: any) {
    let dialogRef = this.dialog.open(AddLookupDialogComponent, {
      data: { item: item, codeMasters: this.codeMasters },
      width: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(res => { if(res) this.getLookups(); });
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