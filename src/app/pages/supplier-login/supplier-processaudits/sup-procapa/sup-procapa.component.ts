import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsEditComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { ProcessActionsGridComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { ProcessDocPopComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-doc-pop/process-doc-pop.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sup-procapa',
  templateUrl: './sup-procapa.component.html',
  styleUrls: ['./sup-procapa.component.scss']
})
export class SupProcapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false;
  totalSize = 0;
  myGroup!: FormGroup;

  originalTableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
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

    // Initialize data
    this.originalTableList = [...this.tableList];
    this.totalSize = this.tableList.length;
  }

  // Get dynamic count of alerts
  get alertsCount(): number {
    return this.originalTableList.filter(item => item.isAlert).length;
  }

  // Toggle alerts filtering
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

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase() : '';

    // Apply keyword search on top of current view (Alerts vs All)
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
    this.isAlertsView = false;
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  tableList = [
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
    // Adding Mock Alert Item 1
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
    // Adding Mock Alert Item 2
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
    { item_id: 10, item_text: '10' }
  ];

  sortOrder = [
    { item_id: 1, item_text: 'ASC' },
    { item_id: 2, item_text: 'DESC' }
  ];

  IsNew = [
    { item_id: 1, item_text: 'New' },
    { item_id: 2, item_text: 'Regular' }
  ];

  ScoreMatrix = [
    { item_id: 1, item_text: 'Assembly' },
    { item_id: 2, item_text: 'Service' },
    { item_id: 3, item_text: 'Performance' },
    { item_id: 4, item_text: 'Functional' }
  ];

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

  processgrid() {
    this.dialog.open(ProcessActionsGridComponent, {
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

  docsPhoto() {
    this.dialog.open(ProcessDocPopComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog' 
    });
  }
}