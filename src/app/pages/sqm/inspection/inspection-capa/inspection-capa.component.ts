import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditissuesComponent } from 'src/app/editissues/editissues.component';
import { ActionDescRemarksComponent } from '../../process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { IssuesGridColumnsComponent } from 'src/app/pages/testing/testing-issues/issues-grid-columns/issues-grid-columns.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AddIssuesssComponent } from 'src/app/pages/testing/testing-issues/add-issuesss/add-issuesss.component';
import { ProcessActionsEditComponent } from '../../process-audits/paudits-actions/process-actions-edit/process-actions-edit.component';
import { PartsActionsDocsComponent } from '../../parts-audits/parts-actions/parts-actions-docs/parts-actions-docs.component';
import { ProcessActionsGridComponent } from '../../process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { PartsActionsGridComponent } from '../../parts-audits/parts-actions/parts-actions-grid/parts-actions-grid.component';
import { PartsActionsEditComponent } from '../../parts-audits/parts-actions/parts-actions-edit/parts-actions-edit.component';
import { InspectionService } from '../inspection.service';
import { AlertService } from 'src/app/shared/alert.service';
import { InspectionDocspopComponent } from './inspection-docspop/inspection-docspop.component';
import { CapaEditPopComponent } from './capa-edit-pop/capa-edit-pop.component';

@Component({
  selector: 'app-inspection-capa',
  templateUrl: './inspection-capa.component.html',
  styleUrls: ['./inspection-capa.component.scss'],
  providers: [DatePipe]
})
export class InspectionCapaComponent implements OnInit {

  filterToggle: boolean = false;
  totalSize = 0;
  pageSize = 5;
  pageIndex = 0;
  pagedTableList: any[] = [];
  myGroup!: FormGroup;

  tableList: any[] = [];
  originalTableList: any[] = [];
  processCategories: string[] = [];
  supplierNames: string[] = [];
  actionTypes: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  someElementRef: any;

  // Filter Arrays
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
    { item_id: 1, item_text: '1' }, { item_id: 2, item_text: '2' },
    { item_id: 3, item_text: '3' }, { item_id: 4, item_text: '4' },
    { item_id: 5, item_text: '5' }, { item_id: 6, item_text: '6' },
    { item_id: 7, item_text: '7' }, { item_id: 8, item_text: '8' },
    { item_id: 9, item_text: '9' }, { item_id: 10, item_text: '10' },
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

  constructor(
    public dialog: MatDialog,
    private inspectionService: InspectionService,
    private datePipe: DatePipe,
    private alertService: AlertService
  ) { }

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

    this.fetchPendingCapas();
  }

  
 fetchPendingCapas() {
    this.inspectionService.getPendingCapaRecords().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.tableList = res.data.map((item: any) => {

            let delay = 0;
            if (item.etaDate) {
              const eta = new Date(item.etaDate);
              const completion = item.completion ? new Date(item.completion) : new Date();
              eta.setHours(0, 0, 0, 0);
              completion.setHours(0, 0, 0, 0);
              const diffTime = completion.getTime() - eta.getTime();
              if (diffTime > 0) {
                delay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              }
            }

            return {
              capaId: item.capaId,
              inspectionRefId: item.inspectionRefId, 
              status: item.status,
              resolved: item.resolved,
              docs: item.docs,
              actionSubject: item.actionSubject,
              supplierName: item.supplierName,
              actionType: item.actionType,
              auditReference: item.auditReference,
              processCategory: item.processCategory,
              description: item.description,
              supplierRemarks: item.supplierRemarks,
              
              // --- MAPPED MISSING FIELDS HERE ---
              etaDate: item.etaDate ? this.datePipe.transform(item.etaDate, 'dd-MMM-yyyy') : '-',
              auditorRemarks: item.auditorRemarks || '-',
              auditeeResponse: item.auditeeResponse || '-',
              
              // Safely transform existing dates
              logDate: item.logDate ? this.datePipe.transform(item.logDate, 'dd-MMM-yyyy') : '-',
              dueDate: item.dueDate ? this.datePipe.transform(item.dueDate, 'dd-MMM-yyyy') : '-',
              completion: item.completion ? this.datePipe.transform(item.completion, 'dd-MMM-yyyy') : '-',
              
              reference: item.reference,
              delayInDays: delay > 0 ? delay : null,
              severity: item.severity,
              occurrence: item.occurrence,
              detection: item.detection,
              riskRating: item.riskRating,
              rating: item.rating,
              pdcaStatus: item.pdcaStatus
            };
          });

          this.originalTableList = [...this.tableList];
          this.pageIndex = 0;
          this.updatePagedList();
          this.populateFilterDropdowns();
        }
      },
      error: (err) => {
        console.error("Error fetching CAPA records:", err);
      }
    });
  }

  populateFilterDropdowns() {
    this.processCategories = Array.from(new Set(this.originalTableList.map(item => item.processCategory).filter(Boolean))).sort();
    this.supplierNames = Array.from(new Set(this.originalTableList.map(item => item.supplierName).filter(Boolean))).sort();
    this.actionTypes = Array.from(new Set(this.originalTableList.map(item => item.actionType).filter(Boolean))).sort();
  }

  onInlineChange(applicant: any) {
    const payload = {
      capaId: applicant.capaId,
      status: applicant.status,
      resolved: applicant.resolved,
      riskRating: applicant.riskRating // This will now send "High", "Medium", or "Low" natively
    };

    this.inspectionService.updateCapaInlineStatus(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('Record updated successfully');
          this.alertService.createAlert('Record updated successfully', 1);
        } else {
          this.alertService.createAlert(res.message || 'Failed to update record', 0);
        }
      },
      error: (err) => {
        console.error("Failed to update record", err);
        this.alertService.createAlert(err.error?.message || 'An error occurred while updating the record.', 0);
      }
    });
  }

  // DIALOGS & UI EVENTS

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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Delete Confirmation',
        content: 'Are you sure you want to permanently delete this CAPA record?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inspectionService.deleteCapa(item.capaId).subscribe({
          next: (res) => {
            if (res.success) {
              this.alertService.createAlert('CAPA deleted successfully!', 1);
              this.fetchPendingCapas();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete CAPA', 0);
            }
          },
          error: (err) => this.alertService.createAlert('An error occurred while deleting the CAPA record.', 0)
        });
      }
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

  editparts() {
    this.dialog.open(PartsActionsEditComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  docsPhoto(capaId: number) {
    this.dialog.open(InspectionDocspopComponent, {
      width: '750px', // slightly wider to accommodate the nice table
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: { capaId: capaId } // Send the CapaId to the popup
    });
  }

  editrow(applicant: any) {
    const dialogRef = this.dialog.open(CapaEditPopComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: applicant // Pass the row data here
    });

    // Refresh the grid if the dialog was saved successfully
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchPendingCapas();
      }
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

  updatePagedList() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTableList = this.tableList.slice(startIndex, endIndex);
    this.totalSize = this.tableList.length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagedList();
  }

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword ? filters.Keyword.toLowerCase().trim() : '';
    const processCategory = filters.TractorIdSections;
    const supplierName = filters.ResponsibleSections;
    const actionType = filters.ResponsibleSectionLeadId;

    this.tableList = this.originalTableList.filter(item => {
      let isMatch = true;

      if (keyword) {
        isMatch = isMatch && !!(item.actionSubject && item.actionSubject.toLowerCase().includes(keyword));
      }
      if (processCategory) {
        isMatch = isMatch && item.processCategory === processCategory;
      }
      if (supplierName) {
        isMatch = isMatch && item.supplierName === supplierName;
      }
      if (actionType) {
        isMatch = isMatch && item.actionType === actionType;
      }
      return isMatch;
    });

    this.pageIndex = 0;
    this.updatePagedList();
  }

  clearFilter() {
    this.myGroup.reset();
    this.tableList = [...this.originalTableList];
    this.pageIndex = 0;
    this.updatePagedList();
  }
}