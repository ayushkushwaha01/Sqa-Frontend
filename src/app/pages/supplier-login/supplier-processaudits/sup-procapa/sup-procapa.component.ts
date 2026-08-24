import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProcessAuditService } from 'src/app/pages/sqm/process-audits/process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ActionDescRemarksComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/action-desc-remarks/action-desc-remarks.component';
import { ProcessActionsGridComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-actions-grid/process-actions-grid.component';
import { ProcessDocPopComponent } from 'src/app/pages/sqm/process-audits/paudits-actions/process-doc-pop/process-doc-pop.component';
import { PartAuditService } from 'src/app/pages/sqm/parts-audits/part-audit.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';

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
  tableList: any[] = [];
  pagedTableList: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  TractorIdSections: any[] = [];
  responsibleSections: any[] = [];
  resSectionFilterLeads: any[] = [];
  pageSize: number = 5;

  constructor(
    public dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService, private partAuditService: PartAuditService
  ) { }

  ngOnInit(): void {
    const gridLength = localStorage.getItem('GridLength');

    if (gridLength) {
      this.pageSize = Number(gridLength);
    }
    this.myGroup = new FormGroup({
      Keyword: new FormControl(''),
      TractorIdSections: new FormControl(''),
      ResponsibleSections: new FormControl(''),
      ResponsibleSectionLeadId: new FormControl('')
    });

    this.loadData();
    this.loadGridColumns();
  }

  // loadData() {
  //     //   Grab the logged-in Supplier's ID
  //     const supplierId = Number(localStorage.getItem('UserId')) || 0;

  //     //   Pass it to the API
  //     this.api.getAllCapasSupplie(supplierId).subscribe((res: any) => {
  //       if (res.success) {
  //         this.originalTableList = res.data.map((item: any) => ({
  //           capaId: item.capaId,
  //           status: item.status,
  //           resolved: item.resolved,
  //           docs: item.docs,
  //           reference: item.reference,
  //           actionSubject: item.actionSubject,
  //           supplierName: item.supplierName,
  //           actionType: item.actionType,
  //           auditReference: item.auditReference,
  //           processCategory: item.processCategory,
  //           description: item.description,
  //           supplierRemarks: item.supplierRemarks,
  //           logDate: new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
  //           dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
  //           delayInDays: item.delayInDays,
  //           completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
  //           severity: item.severity,
  //           occurrence: item.occurrence,
  //           detection: item.detection,
  //           riskRating: item.riskRating,
  //           rating: item.rating,
  //           pdcaStatus: item.pdcaStatus,
  //           isAlert: item.delayInDays > 5 
  //         }));

  //         this.tableList = [...this.originalTableList];
  //         this.totalSize = this.tableList.length;

  //         // Dynamic filters based on actual loaded data
  //         this.TractorIdSections = [...new Set(res.data.map((i: any) => i.processCategory).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
  //         this.responsibleSections = [...new Set(res.data.map((i: any) => i.supplierName).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
  //         this.resSectionFilterLeads = [...new Set(res.data.map((i: any) => i.actionType).filter(Boolean))].map(val => ({ UserId: val, UserName: val }));
  //       }
  //     });
  //   }

  loadData() {
    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    this.api.getAllCapasSupplie(supplierId).subscribe((res: any) => {
      if (res.success) {
        this.originalTableList = res.data.map((item: any) => ({
          capaId: item.capaId,
          processAuditId: item.processAuditId,        // 🔥 Added
          processCategoryId: item.processCategoryId,  // 🔥 Added
          checklistId: item.checklistId,              // 🔥 Added
          auditReference: item.auditReference,        // 🔥 Added
          status: item.status,
          resolved: item.resolved,
          docs: item.docs,
          reference: item.reference,
          actionSubject: item.actionSubject,
          supplierName: item.supplierName,
          actionType: item.actionType,
          processCategory: item.processCategory,
          description: item.description,
          supplierRemarks: item.supplierRemarks,
          logDate: new Date(item.logDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
          dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
          delayInDays: item.delayInDays,
          completion: item.completion ? new Date(item.completion).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
          severity: item.severity,
          occurrence: item.occurrence,
          detection: item.detection,
          riskRating: item.riskRating,
          rating: item.rating,
          pdcaStatus: item.pdcaStatus,
          isAlert: item.delayInDays > 5
        }));

        this.tableList = [...this.originalTableList];
        this.totalSize = this.tableList.length;
        this.updatePagination();

        // Dynamic filters
        this.TractorIdSections = [...new Set(res.data.map((i: any) => i.processCategory).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
        this.responsibleSections = [...new Set(res.data.map((i: any) => i.supplierName).filter(Boolean))].map(val => ({ item_id: val, item_text: val }));
        this.resSectionFilterLeads = [...new Set(res.data.map((i: any) => i.actionType).filter(Boolean))].map(val => ({ UserId: val, UserName: val }));
      }
    });
  }

  updatePagination() {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.pagedTableList = this.tableList.slice(startIndex, startIndex + this.paginator.pageSize);
    } else {
      this.pagedTableList = this.tableList.slice(0, 5); // Default size
    }
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.updatePagination();
    });
    this.updatePagination();
  }

  get alertsCount(): number { return this.originalTableList.filter(item => item.isAlert).length; }

  toggleAlerts() {
    this.isAlertsView = !this.isAlertsView;
    this.tableList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : [...this.originalTableList];
    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }

  go() {
    const filters = this.myGroup.value;
    const keyword = filters.Keyword?.toLowerCase() || '';
    const processCat = filters.TractorIdSections;
    const actionType = filters.ResponsibleSectionLeadId;

    let baseList = this.isAlertsView ? this.originalTableList.filter(item => item.isAlert) : this.originalTableList;

    this.tableList = baseList.filter(item => {
      let isMatch = true;
      if (keyword) {
        const searchStr = `${item.reference} ${item.actionSubject} ${item.actionType} ${item.auditReference} ${item.description}`.toLowerCase();
        isMatch = isMatch && searchStr.includes(keyword);
      }
      if (processCat) isMatch = isMatch && item.processCategory === processCat;
      if (actionType) isMatch = isMatch && item.actionType === actionType;

      return isMatch;
    });

    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }

  clearFilter() {
    this.myGroup.reset();
    this.isAlertsView = false;
    this.tableList = [...this.originalTableList];
    this.totalSize = this.tableList.length;
    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }

  scrollRight() { document.getElementById('grid-table-container')?.scrollBy({ left: 300, behavior: 'smooth' }); }
  scrollLeft() { document.getElementById('grid-table-container')?.scrollBy({ left: -300, behavior: 'smooth' }); }

  imageSource1() { this.dialog.open(ActionDescRemarksComponent, { width: '500px', height: 'auto' }); }
  processgrid() { this.dialog.open(ProcessActionsGridComponent, { width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog' }); }
  docsPhoto(applicant: any) {
    const dialogRef = this.dialog.open(ProcessDocPopComponent, {
      width: '650px', height: 'auto', maxHeight: '90vh', panelClass: 'no-scroll-dialog', data: applicant
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadData();
    });
  }

  // 🔥 Strictly Read-Only
  deleteConfirmation(item: any) {
    this.alertService.createAlert('Suppliers do not have permission to delete CAPA records.', 0);
  }

  defaultColumns: string[] = [
    'Status',
    'Resolved',
    'Docs',
    'Reference',
    'CAPA Subject',
    'Supplier Name',
    'Action Type',
    'Audit Reference',
    'Process Category',
    'Description',
    'Supplier Remarks',
    'Log Date',
    'Due Date',
    'Delay In Days',
    'Completion Date',
    'Severity',
    'Occurrence',
    'Detection',
    'Risk Rating',
    'Rating',
    'PDCA Status'
  ];

  activeColumns: string[] = [];

  frozenCount: number = 0;


  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Status': 150,
      'Resolved': 110,
      'Docs': 100,
      'Reference': 180,
      'CAPA Subject': 220,
      'Supplier Name': 180,
      'Action Type': 150,
      'Audit Reference': 180,
      'Process Category': 180,
      'Description': 120,
      'Supplier Remarks': 120,
      'Log Date': 150,
      'Due Date': 150,
      'Delay In Days': 140,
      'Completion Date': 160,
      'Severity': 120,
      'Occurrence': 120,
      'Detection': 120,
      'Risk Rating': 150,
      'Rating': 120,
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
        userId: 1, // Replace with logged-in user ID
        gridType: 'SupplierCapaTable',
        defaultColumns: this.defaultColumns
      }

    });

    dialogRef.afterClosed().subscribe((didSave: boolean) => {

      if (didSave) {

        this.alertService.createAlert(
          'Column layout updated successfully.'
        );

        this.loadGridColumns();

      }

    });

  }


  loadGridColumns() {

    const filter = {
      userId: 1, // Replace with logged-in user ID
      gridType: 'SupplierCapaTable'
    };

    this.partAuditService.getgridcolumns(filter).subscribe({

      next: (res: any) => {

        if (res.success && res.data) {

          const parsedData = JSON.parse(
            res.data.selectedColumnsJSON
          );

          // Support old format
          if (Array.isArray(parsedData)) {

            this.activeColumns = parsedData;
            this.frozenCount = 0;

          }
          else {

            this.activeColumns =
              parsedData.columns ||
              [...this.defaultColumns];

            this.frozenCount =
              parsedData.frozenCount || 0;

          }

        }
        else {

          this.activeColumns = [
            ...this.defaultColumns
          ];

          this.frozenCount = 0;

        }

      },

      error: (error) => {

        console.error(
          'Error loading grid columns',
          error
        );

        this.activeColumns = [
          ...this.defaultColumns
        ];

        this.frozenCount = 0;

      }

    });

  }
}