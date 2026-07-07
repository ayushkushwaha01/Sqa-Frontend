import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { PartsActionsGridComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { PartsActionsEditComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-edit/parts-actions-edit.component';
import { PartsActionsDocsComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-docs/parts-actions-docs.component';
import { ProcessActionsEditComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { ProcessActionsGridComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-sup-parts-capa',
  templateUrl: './sup-parts-capa.component.html',
  styleUrls: ['./sup-parts-capa.component.scss']
})
export class SupPartsCapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false; // Tracks if alerts filter is active
  totalSize = 0;
  myGroup!: FormGroup;
  originalTableList: any[] = [];
  tableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  someElementRef: any;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.myGroup = new FormGroup({
      firstName: new FormControl(''),
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl(''),
      SubGroupId: new FormControl(''),
      ORCStatuses: new FormControl(''),
      IsNew: new FormControl(''),
      ScoreMatrix: new FormControl(''),
      Probability: new FormControl(''),
      PartCode: new FormControl(''),
      CategoryId: new FormControl(''),
      sortOrder: new FormControl('')
    });

    this.tableList = [...this.mockData];
    this.originalTableList = [...this.mockData];
    this.totalSize = this.tableList.length; 
  }

  // Helper getter to count total alerts dynamically
  get alertsCount(): number {
    return this.originalTableList.filter(item => item.isAlert).length;
  }

  // Toggle filtering logic for the Alerts button
  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    if (this.isAlertsView) {
      this.tableList = this.originalTableList.filter(item => item.isAlert);
    } else {
      this.tableList = [...this.originalTableList];
    }
    
    this.totalSize = this.tableList.length;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  mockData = [
    {
      status: 'WIP',
      resolved: true,
      docs: 2,
      photos: 2,
      actionSubject: 'Supplier Risk Assessment',
      supplierName: 'Global Tech Supplies',
      actionType: 'Containment',
      auditReference: 'AT12345',
      processArea: 'Quality Control',
      processCategory: 'Manufacturing',
      description: 'Found variations in raw material quality.',
      supplierRemarks: 'Awaiting new batch testing.',
      logDate: '01-Jan-2024',
      dueDate: '15-Jan-2024',
      completion: '12-Jan-2024',
      reference: '25416',
      delayInDays: 3,
      severity: 8,
      occurrence: 5,
      detection: 2,
      riskRating: 'Medium',
      rating: 4,
      pdcaStatus: 'Plan',
      capaActionType: 'Containment',
      isAlert: false
    },
    // Adding an ALERT record
    {
      status: 'Open',
      resolved: false,
      docs: 1,
      photos: 1,
      actionSubject: 'Critical Material Shortage',
      supplierName: 'Global Tech Supplies',
      actionType: 'Preventive',
      auditReference: 'AT12399',
      processArea: 'Supply Chain',
      processCategory: 'Procurement',
      description: 'Severe delay in raw material delivery.',
      supplierRemarks: 'Seeking alternative sources immediately.',
      logDate: '05-Jan-2024',
      dueDate: '08-Jan-2024',
      completion: '-',
      reference: '99001',
      delayInDays: 7,
      severity: 10,
      occurrence: 9,
      detection: 5,
      riskRating: 'High',
      rating: 1,
      pdcaStatus: 'Plan',
      capaActionType: 'Preventive',
      isAlert: true
    },
    {
      status: 'Open',
      resolved: false,
      docs: 2,
      photos: 2,
      actionSubject: 'Product Recall Review',
      supplierName: 'Ace Components',
      actionType: 'Corrective',
      auditReference: 'AT67890',
      processArea: 'Logistics',
      processCategory: 'Distribution',
      description: 'Packaging defect causing transit damage.',
      supplierRemarks: 'Investigating packaging line.',
      logDate: '10-Feb-2024',
      dueDate: '20-Feb-2024',
      completion: '19-Feb-2024',
      reference: '25419',
      delayInDays: 2,
      severity: 9,
      occurrence: 8,
      detection: 8,
      riskRating: 'High',
      rating: 2,
      pdcaStatus: 'Do',
      capaActionType: 'Corrective',
      isAlert: false
    },
    // Adding an ALERT record
    {
      status: 'Pending',
      resolved: false,
      docs: 3,
      photos: 0,
      actionSubject: 'Compliance Violation detected',
      supplierName: 'Ace Components',
      actionType: 'Corrective',
      auditReference: 'AT67811',
      processArea: 'Regulatory',
      processCategory: 'Distribution',
      description: 'Non-compliant shipping labels identified at customs.',
      supplierRemarks: 'Halted shipments until label corrected.',
      logDate: '12-Feb-2024',
      dueDate: '14-Feb-2024',
      completion: '-',
      reference: '99002',
      delayInDays: 5,
      severity: 9,
      occurrence: 7,
      detection: 9,
      riskRating: 'High',
      rating: 2,
      pdcaStatus: 'Act',
      capaActionType: 'Corrective',
      isAlert: true
    },
    {
      status: 'WIP',
      resolved: false,
      docs: 2,
      photos: 2,
      actionSubject: 'Supplier Certification Audit',
      supplierName: 'Prime Manufacturing',
      actionType: 'Preventive',
      auditReference: 'AT34321',
      processArea: 'Compliance',
      processCategory: 'Certification',
      description: 'ISO certification expired.',
      supplierRemarks: 'Audit scheduled for next week.',
      logDate: '05-Mar-2024',
      dueDate: '15-Mar-2024',
      completion: null,
      reference: '25417',
      delayInDays: 4,
      severity: 4,
      occurrence: 2,
      detection: 1,
      riskRating: 'Low',
      rating: 5,
      pdcaStatus: 'Check',
      capaActionType: 'Preventive',
      isAlert: false
    },
    {
      status: 'In Progress',
      resolved: false,
      docs: 2,
      photos: 2,
      actionSubject: 'Supplier Risk Assessment',
      supplierName: 'Global Tech Supplies',
      actionType: 'Corrective',
      auditReference: 'AT12345',
      processArea: 'Quality Control',
      processCategory: 'Manufacturing',
      description: 'Calibration error on primary scales.',
      supplierRemarks: 'Vendor notified for recalibration.',
      logDate: '01-Jan-2024',
      dueDate: '15-Jan-2024',
      completion: '12-Jan-2024',
      reference: '25438',
      delayInDays: 6,
      severity: 7,
      occurrence: 6,
      detection: 7,
      riskRating: 'High',
      rating: 3,
      pdcaStatus: 'Act',
      capaActionType: 'Corrective',
      isAlert: false
    },
    // Adding an ALERT record
    {
      status: 'Open',
      resolved: false,
      docs: 1,
      photos: 1,
      actionSubject: 'Machine Breakdown Warning',
      supplierName: 'Prime Manufacturing',
      actionType: 'Containment',
      auditReference: 'AT34399',
      processArea: 'Operations',
      processCategory: 'Manufacturing',
      description: 'Key assembly line machine failing diagnostics repeatedly.',
      supplierRemarks: 'Emergency technician dispatched.',
      logDate: '20-Mar-2024',
      dueDate: '21-Mar-2024',
      completion: '-',
      reference: '99003',
      delayInDays: 2,
      severity: 8,
      occurrence: 9,
      detection: 2,
      riskRating: 'High',
      rating: 3,
      pdcaStatus: 'Do',
      capaActionType: 'Containment',
      isAlert: true
    },
    {
      status: 'Completed',
      resolved: true,
      docs: 2,
      photos: 2,
      actionSubject: 'Product Recall Review',
      supplierName: 'Ace Components',
      actionType: 'Containment',
      auditReference: 'AT67890',
      processArea: 'Logistics',
      processCategory: 'Distribution',
      description: 'Label misprint.',
      supplierRemarks: 'Labels reprinted and replaced.',
      logDate: '10-Feb-2024',
      dueDate: '20-Feb-2024',
      completion: '19-Feb-2024',
      reference: '25419',
      delayInDays: null,
      severity: 3,
      occurrence: 3,
      detection: 2,
      riskRating: 'Low',
      rating: 5,
      pdcaStatus: 'Closed',
      capaActionType: 'Containment',
      isAlert: false
    },
    {
      status: 'WIP',
      resolved: false,
      docs: 2,
      photos: 2,
      actionSubject: 'Supplier Certification Audit',
      supplierName: 'Prime Manufacturing',
      actionType: 'Preventive',
      auditReference: 'AT34321',
      processArea: 'Compliance',
      processCategory: 'Certification',
      description: 'Missing worker safety documentation.',
      supplierRemarks: 'Documents currently being compiled.',
      logDate: '05-Mar-2024',
      dueDate: '15-Mar-2024',
      completion: null,
      reference: '25417',
      delayInDays: null,
      severity: 6,
      occurrence: 5,
      detection: 4,
      riskRating: 'Medium',
      rating: 3,
      pdcaStatus: 'Plan',
      capaActionType: 'Preventive',
      isAlert: false
    }
  ];

  // Dialog Methods
  addTests(applicant: any) {
    let dialogRef = this.dialog.open(EditissuesComponent, {
      height: 'auto',
      width: '5000px',
    });
  }

  imageSource1() {
    this.dialog.open(ActionDescRemarksComponent, {
      width: '500px',
      height: 'auto',
    });
  }

  public addIssues(id: any) {
    let dialogRef = this.dialog.open(AddIssuesssComponent, {
      data: id,
      height: 'auto',
      width: '500px',
    });
  }

  public openGrid(id: any) {
    let dialogRef = this.dialog.open(IssuesGridColumnsComponent, {
      data: id,
      height: 'auto',
      width: '800px',
    });
  }

  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { ProjectId: item.ProjectId, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?' }
    });
  }

  partsgrid() {
    this.dialog.open(PartsActionsGridComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  editparts() {
    this.dialog.open(PartsActionsEditComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  docsPhoto() {
    this.dialog.open(PartsActionsDocsComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  editrow() {
    this.dialog.open(ProcessActionsEditComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  processgrid() {
    this.dialog.open(ProcessActionsGridComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  // Filter Dropdown Data
  tractors = [
    { TractorStatusId: 'ID-01' },
    { TractorStatusId: 'ID-02' },
    { TractorStatusId: 'ID-03' }
  ];

  TractorIdSections = [
    { item_id: 1, item_text: 'ID-01' },
    { item_id: 2, item_text: 'ID-02' },
    { item_id: 3, item_text: 'ID-03' },
  ];

  responsibleSections = [
    { item_id: 1, item_text: 'Front Axle Bracket Area' },
    { item_id: 2, item_text: 'Gearbox' },
    { item_id: 3, item_text: 'Cooling Package' },
    { item_id: 4, item_text: 'Air Intake System' },
  ];

  ORCStatuses = [
    { item_id: 1, item_text: 'O' },
    { item_id: 2, item_text: 'R1' },
    { item_id: 3, item_text: 'R2' },
    { item_id: 4, item_text: 'C' },
  ];

  Probability = [
    { item_id: 1, item_text: '1' },
    { item_id: 2, item_text: '2' },
    { item_id: 3, item_text: '3' },
    { item_id: 4, item_text: '4' },
    { item_id: 5, item_text: '5' },
    { item_id: 6, item_text: '6' },
    { item_id: 7, item_text: '7' },
    { item_id: 8, item_text: '8' },
    { item_id: 9, item_text: '9' },
    { item_id: 10, item_text: '10' },
  ];

  sortOrder = [
    { item_id: 1, item_text: 'ASC' },
    { item_id: 2, item_text: 'DESC' },
  ];

  IsNew = [
    { item_id: 1, item_text: 'New' },
    { item_id: 2, item_text: 'Regular' },
  ];

  ScoreMatrix = [
    { item_id: 1, item_text: 'Assembly' },
    { item_id: 2, item_text: 'Service' },
    { item_id: 3, item_text: 'Performance' },
    { item_id: 4, item_text: 'Functional' },
  ];

  resSectionFilterLeads = [
    { UserId: 'U001', UserName: 'Lead A' },
    { UserId: 'U002', UserName: 'Lead B' },
    { UserId: 'U003', UserName: 'Lead C' }
  ];

  FilterSubgroup = [
    { SubGroupId: 'SG001', SubGroupName: 'Subgroup 1' },
    { SubGroupId: 'SG002', SubGroupName: 'Subgroup 2' },
    { SubGroupId: 'SG003', SubGroupName: 'Subgroup 3' }
  ];

  scorematrix = [
    { ScoreMatrixId: 'FE001', ScoreMatrixName: 'High Impact' },
    { ScoreMatrixId: 'FE002', ScoreMatrixName: 'Medium Impact' },
    { ScoreMatrixId: 'FE003', ScoreMatrixName: 'Low Impact' }
  ];

  categories = [
    { CategoryId: 'C001', CategoryName: 'Detection 1' },
    { CategoryId: 'C002', CategoryName: 'Detection 2' },
    { CategoryId: 'C003', CategoryName: 'Detection 3' }
  ];

  // Scroll Methods
  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  // Filter Methods
  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';

    // Respect current view (Alerts vs All) while searching
    let baseList = this.isAlertsView 
      ? this.originalTableList.filter(item => item.isAlert)
      : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;

      if (keyword) {
        isMatch = isMatch && (
          (item.actionSubject && item.actionSubject.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.description && item.description.toLowerCase().includes(keyword))
        );
      }

      return isMatch;
    });

    this.totalSize = this.tableList.length;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false; // reset alerts view when cleared
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}