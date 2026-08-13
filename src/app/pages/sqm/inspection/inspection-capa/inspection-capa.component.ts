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

  constructor(
    public dialog: MatDialog,
    private inspectionService: InspectionService,
    private datePipe: DatePipe,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl('')
    });

    this.fetchPendingCapas();
  }

  fetchPendingCapas() {
    this.inspectionService.getPendingCapaRecords().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.tableList = res.data.map((item: any) => {

            let delayVal: any = 'N/A';
            if (item.dueDate) {
              const due = new Date(item.dueDate);
              const completion = item.completion ? new Date(item.completion) : new Date();
              due.setHours(0, 0, 0, 0);
              completion.setHours(0, 0, 0, 0);
              const diffTime = completion.getTime() - due.getTime();
              if (diffTime > 0) {
                delayVal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              } else {
                delayVal = 'N/A';
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
              observations: item.observations,
              correctiveActions: item.correctiveActions,
              parameterName: item.parameterName,
              partFamilyName: item.partFamilyName,
              partName: item.partName,
              etaDate: item.etaDate ? this.datePipe.transform(item.etaDate, 'dd-MMM-yyyy') : '-',
              auditorRemarks: item.auditorRemarks || '-',
              auditeeResponse: item.auditeeResponse || '-',
              logDate: item.logDate ? this.datePipe.transform(item.logDate, 'dd-MMM-yyyy') : '-',
              dueDate: item.dueDate ? this.datePipe.transform(item.dueDate, 'dd-MMM-yyyy') : '-',
              completion: item.completion ? this.datePipe.transform(item.completion, 'dd-MMM-yyyy') : '-',
              reference: item.reference,
              delayInDays: delayVal,
              severity: item.severity,
              occurrence: item.occurrence,
              detection: item.detection,
              riskRating: item.riskRating || 'N/A',
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
      resolved: applicant.resolved
    };

    this.inspectionService.updateCapaInlineStatus(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
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
          error: () => this.alertService.createAlert('An error occurred while deleting the CAPA record.', 0)
        });
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

  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(InspectionDocspopComponent, {
      width: '750px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog',
      data: {
        capaId: applicant.capaId,
        inspectionRefId: applicant.inspectionRefId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.fetchPendingCapas();
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