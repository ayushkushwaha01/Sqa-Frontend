import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { PartsActionsGridComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { InspectionService } from 'src/app/pages/sqm/inspection/inspection.service';


@Component({
  selector: 'app-supplier-capa',
  templateUrl: './supplier-capa.component.html',
  styleUrls: ['./supplier-capa.component.scss']
})
export class SupplierCapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false; 
  
  // Pagination and Data Tracking
  originalTableList: any[] = [];
  tableList: any[] = [];
  pagedTableList: any[] = []; // 🔥 Bound to the HTML table
  totalSize = 0;
  pageSize = 5;
  pageIndex = 0;
  alertsCount: number = 0;

  myGroup!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Dropdown Lookups (Keep your existing static ones or load dynamically)
  TractorIdSections = [
    { item_id: 1, item_text: 'ID-01' },
    { item_id: 2, item_text: 'ID-02' },
    { item_id: 3, item_text: 'ID-03' },
  ];
  responsibleSections = [
    { item_id: 1, item_text: 'Front Axle Bracket Area' },
    { item_id: 2, item_text: 'Gearbox' }
  ];
  resSectionFilterLeads = [
    { UserId: 'U001', UserName: 'Lead A' },
    { UserId: 'U002', UserName: 'Lead B' }
  ];

  constructor(
    public dialog: MatDialog,
    private api: InspectionService
  ) { }

  ngOnInit(): void {
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl(''),
    });

    this.loadData();
  }

  loadData() {
    // 🔥 Grab the logged-in Supplier's ID
    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    this.api.getPendingCapaRecords(supplierId).subscribe((res: any) => {
      if (res.success && res.data) {
        // Map backend keys to frontend properties
        this.originalTableList = res.data.map((item: any) => {
          return {
            id: item.capaId,
            status: item.status === 1 ? 'Closed' : (item.status === 2 ? 'Open' : 'WIP'), // Adjust logic based on your Status mapping
            resolved: item.resolved,
            docs: item.docs,
            actionSubject: item.actionSubject,
            supplierName: item.supplierName,
            actionType: item.actionType,
            auditReference: item.auditReference,
            processCategory: item.processCategory,
            description: item.description,
            supplierRemarks: item.supplierRemarks,
            logDate: item.logDate ? new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dateCreated: item.logDate ? new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dateResolved: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dateClosed: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            reference: item.reference,
            delayInDays: item.delayInDays || null,
            severity: item.severity,
            occurrence: item.occurrence,
            detection: item.detection,
            riskRating: item.riskRating || 'Medium',
            rating: item.rating,
            pdcaStatus: item.pdcaStatus || 'Plan',
            isAlert: item.delayInDays > 0 // Example logic: If delayed, flag as alert
          };
        });

        this.alertsCount = this.originalTableList.filter(item => item.isAlert).length;
        this.go(); // Apply filters and update pagination natively
      }
    });
  }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.go();
  }

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';

    let baseList = this.isAlertsView 
      ? this.originalTableList.filter(item => item.isAlert)
      : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;

      if (keyword) {
        isMatch = isMatch && (
          (item.actionSubject && item.actionSubject.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.description && item.description.toLowerCase().includes(keyword)) ||
          (item.reference && item.reference.toLowerCase().includes(keyword))
        );
      }
      return isMatch;
    });

    this.totalSize = this.tableList.length;
    this.pageIndex = 0; // Reset to page 1 on filter
    
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    this.pageIndex = 0;
    
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagination();
  }

  // 🔥 Pagination Handlers
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  updatePagination() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTableList = this.tableList.slice(start, end);
  }

  // UI / Modal Actions
  scrollRight() {
    document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' });
  }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }
  docsPhoto() { console.log("Docs/Photos clicked"); }
  processgrid() {
    this.dialog.open(PartsActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }
  deleteConfirmation(item: any) {
    this.dialog.open(ConfirmationDialogComponent, { width: 'auto', data: { title: 'Delete', content: 'Are you sure?' } });
  }
}