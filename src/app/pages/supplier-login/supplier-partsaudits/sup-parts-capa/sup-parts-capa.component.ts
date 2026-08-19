import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
import { PartAuditService } from 'src/app/pages/sqm/parts-audits/part-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';

@Component({
  selector: 'app-sup-parts-capa',
  templateUrl: './sup-parts-capa.component.html',
  styleUrls: ['./sup-parts-capa.component.scss']
})
export class SupPartsCapaComponent implements OnInit {



  tableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  someElementRef: any;


  filterToggle: boolean = false;

  myGroup!: FormGroup;
  originalTableList: any[] = [];
  showFilters: boolean = false;

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 20;
  tableLists: any[] = [];
  constructor(public dialog: MatDialog, private partAuditService: PartAuditService, private alertService: AlertService, private fb: FormBuilder,
    private lookupService: LookupService
  ) { }
  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.formInit();
    this.getCapas();
    this.loadGridColumns();
    this.getLookups();



  }

  filterForm!: FormGroup;

  formInit() {
    this.filterForm = this.fb.group({
      keyword: [''],
      auditParameterId: [null],
      actionType: [''],
      fromDate: [null],
      toDate: [null]
    });
  }
  clearFilters() {

    this.filterForm.reset({
      keyword: '',
      auditParameterId: null,
      actionType: '',
      fromDate: null,
      toDate: null
    });

    this.getCapas();
  }

  lookups: any[] = [];

  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 8);
      }
    });
  }

  // Helper getter to count total alerts dynamically
  get alertsCount(): number {
    return this.originalTableList.filter(item => item.isAlert).length;
  }



  allcaps: any[] = [];
  getCapas() {

    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    const filter = {
      ...this.filterForm.value,
      supplierId: supplierId
    };

    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === '' ||
        filter[key] === undefined
      ) {
        delete filter[key];
      }
    });

    this.partAuditService.getAllCaps(filter)
      .subscribe((res: any) => {

        if (res.success) {

          this.allcaps = res.data.data;
          this.totalSize = res.data.totalRecords;

          this.currentPage = 0;
          this.loadPageData();

        }

      });

  }
  loadPageData() {

    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.allcaps.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );

  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
  }


  defaultColumns: string[] = [
    'Action',
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Action Type',
    'Description',
    'Supplier Remarks',
    'Log Date',
    'Due Date',
    'Delay In Days',
    'Completion Date',
    'Severity',
    'Occurrence',
    'Detection',
    'SOD Score',
    'Risk Rating',
    'PDCA Status'
  ];

  activeColumns: string[] = [];

  frozenCount = 0;
  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Action': 120,
      'Status': 150,
      'Resolved': 110,
      'Docs': 100,
      'Reference': 180,
      'CAPA Subject': 220,
      'Action Type': 160,
      'Description': 120,
      'Supplier Remarks': 170,
      'Log Date': 150,
      'Due Date': 150,
      'Delay In Days': 140,
      'Completion Date': 170,
      'Severity': 100,
      'Occurrence': 120,
      'Detection': 120,
      'SOD Score': 120,
      'Risk Rating': 150,
      'PDCA Status': 150

    };

    return widths[column] || 150;



  }

  getStickyLeft(index: number): string {

    let left = 0;

    for (let i = 0; i < index; i++) {

      left += this.getColumnWidth(this.activeColumns[i]);

    }

    return left + 'px';

  }


  openColumnSelector() {

    const dialogRef = this.dialog.open(ColumnSelectorComponent, {

      width: '750px',

      height: 'auto',

      disableClose: true,

      data: {

        userId: 1,   // Replace with logged-in user id

        gridType: 'SupplierPartsAduitcapa',

        defaultColumns: this.defaultColumns

      }

    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {

      if (didSave) {

        this.alertService.createAlert('Column layout updated successfully.');

        this.loadGridColumns();

      }

    });

  }


  loadGridColumns() {

    const filter = {

      userId: 1, // Replace with logged-in user id

      gridType: 'SupplierPartsAduitcapa'

    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData = JSON.parse(res.data.selectedColumnsJSON);

          // Old format support
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns = parsedData.columns || [...this.defaultColumns];
            this.frozenCount = parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [...this.defaultColumns];
          this.frozenCount = 0;

        }

      },

      error: (error) => {

        console.error('Error loading grid columns', error);

        this.activeColumns = [...this.defaultColumns];
        this.frozenCount = 0;

      }

    });

  }













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


}