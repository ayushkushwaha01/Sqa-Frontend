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
import { InspectionDocspopComponent } from 'src/app/pages/sqm/inspection/inspection-capa/inspection-docspop/inspection-docspop.component';

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
  pagedTableList: any[] = []; 
  totalSize = 0;
  pageSize = 5;
  pageIndex = 0;
  alertsCount: number = 0;

  myGroup!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    this.api.getPendingCapaRecords(supplierId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.originalTableList = res.data.map((item: any) => {
          return {
            id: item.capaId,
            inspectionRefId: item.inspectionRefId,
            status: item.status === 1 ? 'WIP' :
                    item.status === 2 ? 'Open' :
                    item.status === 3 ? 'Closed' :
                    item.status === 4 ? 'Pending' :
                    item.status === 5 ? 'In Progress' :
                    item.status === 6 ? 'Completed' : item.status, 
            resolved: item.resolved,
            docs: item.docs,
            reference: item.reference,
            actionSubject: item.actionSubject,
            parameterName: item.parameterName,
            partFamilyName: item.partFamilyName,
            partName: item.partName,
            supplierName: item.supplierName,
            actionType: item.actionType,
            auditReference: item.auditReference,
            processCategory: item.processCategory,
            supplierRemarks: item.supplierRemarks,
            logDate: item.logDate ? new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            etaDate: item.etaDate ? new Date(item.etaDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            auditorRemarks: item.auditorRemarks,
            auditeeResponse: item.auditeeResponse,
            delayInDays: item.delayInDays || null,
            completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            severity: item.severity,
            occurrence: item.occurrence,
            detection: item.detection,
            riskRating: item.riskRating || 'Medium',
            rating: item.rating,
            pdcaStatus: item.pdcaStatus || '-',
            isAlert: item.delayInDays > 0
          };
        });

        this.alertsCount = this.originalTableList.filter(item => item.isAlert).length;
        this.go(); 
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
          (item.reference && item.reference.toLowerCase().includes(keyword))
        );
      }
      return isMatch;
    });

    this.totalSize = this.tableList.length;
    this.pageIndex = 0; 

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

  scrollRight() {
    document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' });
  }

  scrollLeft() {
    document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' });
  }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }
  
  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(InspectionDocspopComponent, {
      width: '750px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: { 
        capaId: applicant.id,
        inspectionRefId: applicant.inspectionRefId,
        isReadOnly: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  processgrid() {
    this.dialog.open(PartsActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' });
  }

  deleteConfirmation(item: any) {
    this.dialog.open(ConfirmationDialogComponent, { width: 'auto', data: { title: 'Delete', content: 'Are you sure?' } });
  }
}