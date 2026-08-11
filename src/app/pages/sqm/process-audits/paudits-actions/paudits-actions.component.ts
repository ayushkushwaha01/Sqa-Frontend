import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { ActionDescRemarksComponent } from './action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from './process-actions-grid/process-actions-grid.component';
import { ProcessActionsEditComponent } from './process-actions-edit/process-actions-edit.component';
import { ProcessDocPopComponent } from './process-doc-pop/process-doc-pop.component';

@Component({
  selector: 'app-paudits-actions',
  templateUrl: './paudits-actions.component.html',
  styleUrls: ['./paudits-actions.component.scss']
})
export class PauditsActionsComponent implements OnInit {
  
  filterToggle: boolean = false;
  totalSize = 0;
  myGroup!: FormGroup;
  originalTableList: any[] = [];
  tableList: any[] = [];
  parentAuditRef: string = 'Pending...';
  targetCategoryId: any = null;   
  targetChecklistId: any = null; 
  
  processCategories: string[] = [];
  suppliers: string[] = [];
  actionTypes: string[] = [];
  
  // 🔥 Store dynamic lookups here
  capaStatusLookups: any[] = [];

  pageSize = 5;
  pageIndex = 0;

  get pagedCapaData() {
    const start = this.pageIndex * this.pageSize;
    return this.tableList.slice(start, start + this.pageSize);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService
  ) { }
  
  ngOnInit(): void {
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      ProcessCategory: new FormControl(''),
      SupplierName: new FormControl(''),
      ActionType: new FormControl('')
    });
    
    this.loadLookups(); // 🔥 Load statuses first
    this.loadData();
  }

  // 🔥 FETCH LOOKUPS FOR DROPDOWN 🔥
  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        // Filter specifically for Capa-Status
        this.capaStatusLookups = res.data.filter((l: any) => l.codeMasterName === 'Capa-Status');
      }
    });
  }

  loadData() {
    this.api.getAllCapas().subscribe((res: any) => {
      if (res.success) {
        this.originalTableList = res.data;
        this.tableList = [...this.originalTableList];
        this.totalSize = this.tableList.length;

        // Extract unique values for dropdowns
        this.processCategories = [...new Set(res.data.map((item: any) => item.processCategory).filter(Boolean))] as string[];
        this.suppliers = [...new Set(res.data.map((item: any) => item.supplierName).filter(Boolean))] as string[];
        this.actionTypes = [...new Set(res.data.map((item: any) => item.actionType).filter(Boolean))] as string[];
      }
    });
  }

  // onStatusChange(item: any) {
  //   const payload = { CapaId: item.capaId, Status: item.status, IsResolved: item.resolved };
  //   this.api.updateCapaStatus(payload).subscribe((res: any) => {
  //     if (res.success) {
  //       this.alertService.createAlert('Status updated successfully', 1);
  //     } else {
  //       this.alertService.createAlert('Failed to update status', 0);
  //     }
  //   });
  // }

  // onResolvedChange(item: any, event: any) {
  //   item.resolved = event.checked; 
  //   const payload = { CapaId: item.capaId, Status: item.status, IsResolved: item.resolved };
  //   this.api.updateCapaStatus(payload).subscribe((res: any) => {
  //     if (res.success) {
  //       this.alertService.createAlert(item.resolved ? 'Marked as Resolved' : 'Marked as Unresolved', 1);
  //     }
  //   });
  // }

 // 🔥 UPDATE STATUS ON DROPDOWN CHANGE 🔥
  onStatusChange(item: any) {
    const payload = { 
      CapaId: item.capaId, 
      Status: item.status != null ? item.status.toString() : null, 
      IsResolved: item.resolved 
    };
    
    this.api.updateCapaStatus(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert('Status updated successfully', 1);
      } else {
        this.alertService.createAlert('Failed to update status', 0);
      }
    });
  }

  // 🔥 UPDATE RESOLVED ON CHECKBOX CHANGE 🔥
  onResolvedChange(item: any, event: any) {
    item.resolved = event.checked; // Update local model
    
    // Force Status to be a string here as well
    const payload = { 
      CapaId: item.capaId, 
      Status: item.status != null ? item.status.toString() : null, 
      IsResolved: item.resolved 
    };
    
    this.api.updateCapaStatus(payload).subscribe((res: any) => {
      if (res.success) {
        this.alertService.createAlert(item.resolved ? 'Marked as Resolved' : 'Marked as Unresolved', 1);
      }
    });
  }

  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
  }
  
  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  processgrid() {
    this.dialog.open(ProcessActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  editrow() {
    this.dialog.open(ProcessActionsEditComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(ProcessDocPopComponent, { 
      width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog', data: applicant 
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

  imageSource1(description: string) {
    this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' });
  }

  // 🔥 ACTUAL DELETE LOGIC CONNECTED TO API 🔥
  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this CAPA?' }
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.api.deleteCapa({ CapaId: item.capaId }).subscribe((res: any) => {
          if (res.success) {
            this.alertService.createAlert(res.message || 'CAPA deleted successfully', 1);
            this.loadData(); // Refresh grid after delete
          } else {
            this.alertService.createAlert(res.message || 'Failed to delete CAPA', 0);
          }
        });
      }
    });
  }

  go() { 
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';
    const category = filters.ProcessCategory;
    const supplier = filters.SupplierName;
    const actionType = filters.ActionType;

    this.tableList = this.originalTableList.filter(item => {
      let matches = true;
      if (keyword) {
        const searchStr = `${item.reference} ${item.actionSubject} ${item.supplierName} ${item.actionType} ${item.auditReference} ${item.processCategory}`.toLowerCase();
        matches = matches && searchStr.includes(keyword);
      }
      if (category) matches = matches && item.processCategory === category;
      if (supplier) matches = matches && item.supplierName === supplier;
      if (actionType) matches = matches && item.actionType === actionType;
      return matches;
    });

    this.pageIndex = 0;
    this.totalSize = this.tableList.length;
  }

  clearFilter() { 
    this.myGroup.reset();
    this.tableList = [...this.originalTableList];
    this.pageIndex = 0;
    this.totalSize = this.tableList.length;
  }
}