import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { PartsActionsDocsComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-docs/parts-actions-docs.component';
import { PartsActionsEditComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-edit/parts-actions-edit.component';
import { PartsActionsGridComponent } from 'src/app/pages/sqm/parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsEditComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { ProcessActionsGridComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';

@Component({
  selector: 'app-supplier-capa',
  templateUrl: './supplier-capa.component.html',
  styleUrls: ['./supplier-capa.component.scss']
})
export class SupplierCapaComponent implements OnInit {

  filterToggle: boolean = false;
  isAlertsView: boolean = false; // Tracks if alerts filter is active
  totalSize = 0;
  myGroup!: FormGroup;
  originalTableList: any[] = [];
  alertsCount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  someElementRef: any;

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
      dateCreated: '02-Jan-2024',
      dateResolved: '10-Jan-2024',
      dateClosed: '12-Jan-2024',
      completion: '12-Jan-2024',
      reference: '2026/ENG/098121',
      delayInDays: 3,
      severity: 8,
      occurrence: 5,
      detection: 2,
      riskRating: 'Medium',
      rating: 4,
      pdcaStatus: 'Plan',
      capaActionType: 'Containment',
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
      dateCreated: '19-Jan-2024',
      dateResolved: '10-Feb-2024',
      dateClosed: '24-Jan-2024',
      completion: '19-Feb-2024',
      reference: '2026/ENG/098122',
      delayInDays: 2,
      severity: 9,
      occurrence: 8,
      detection: 8,
      riskRating: 'High',
      rating: 2,
      pdcaStatus: 'Do',
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
      dateCreated: '1-Mar-2024',
      dateResolved: '11-May-2024',
      dateClosed: '05-Apr-2024',
      completion: null,
      reference: '2026/ENG/098123',
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
      dateCreated: '07-Dec-2024',
      dateResolved: '18-Jun-2024',
      dateClosed: '13-Mar-2024',
      completion: '12-Jan-2024',
      reference: '2026/ENG/098124',
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
      dateCreated: '02-Feb-2024',
      dateResolved: '25-Aug-2024',
      dateClosed: '29-Sept-2024',
      completion: '28-Nov-2024',
      reference: '2026/ENG/098125',
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
      dateCreated: '14-Feb-2024',
      dateResolved: '27-Oct-2024',
      dateClosed: '21-Nov-2024',
      completion: null,
      reference: '2026/ENG/098126',
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

    this.originalTableList = [...this.tableList];
    this.totalSize = this.tableList.length;
    this.alertsCount = this.originalTableList.filter(item => item.isAlert).length;
  }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.go();
  }

  addTests(applicant: any) {
    let dialogRef = this.dialog.open(EditissuesComponent, {
      height: 'auto',
      width: '900px',
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

  partsgrid() {
    this.dialog.open(PartsActionsGridComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  processgrid() {
    this.partsgrid(); // Call mapped logic or open ProcessActionsGridComponent
  }

  editrow() {
    // Implement edit logic here
    console.log("Edit row clicked");
  }

  docsPhoto() {
    // Implement docs/photo logic here
    console.log("Docs/Photos clicked");
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
}