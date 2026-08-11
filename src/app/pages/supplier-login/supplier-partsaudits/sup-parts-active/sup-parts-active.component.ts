import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { NewAuditComponent } from 'src/app/pages/sqm/parts-audits/new-audit/new-audit.component';
import { PartAuditService } from 'src/app/pages/sqm/parts-audits/part-audit.service';
import { ActiveGridDialogComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { AuditDonePopupComponent } from 'src/app/pages/sqm/process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/audit-done-popup/audit-done-popup.component';
import { CommodityService } from 'src/app/pages/sqm/process-audits/paudits-setup/commodity-master/commodity.service';
import { AlertService } from 'src/app/shared/alert.service';
// import { NewAuditComponent } from '../new-audit/new-audit.component';
// import { ActiveGridDialogComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
// import { AuditDonePopupComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/audit-done-popup/audit-done-popup.component';

@Component({
  selector: 'app-sup-parts-active',
  templateUrl: './sup-parts-active.component.html',
  styleUrls: ['./sup-parts-active.component.scss']
})
export class SupPartsActiveComponent implements OnInit {


  Highcharts: typeof Highcharts = Highcharts;

  showFilters: boolean = false;

  currentPage: number = 0;
  totalSize: number = 0;
  fromIndex: number = 0;
  pageSize: number = 5;
  tableLists: any[] = [];
  ngOnInit(): void {
    this.fomrInit();

    this.getPartsAuidt();
    this.getLookups();
    this.getPartsFamilies();
    this.getParts();
    this.getCommodities();
    this.getSuppliers();
    this.getStates();
    this.getCities();
    this.getAuditors();
    this.loadGridColumns();

  }

  constructor(private dialog: MatDialog, private partAuditService: PartAuditService, private lookupService: LookupService, private fb: FormBuilder,
    private alertService: AlertService, private _setupService: SetupService, private api: CommodityService, private manageUsersService: ManageUsersService,
  ) { }
  padId(id: number): string {
    return String(id).padStart(6, '0');
  }

  filterForm!: FormGroup;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  fomrInit() {
    this.filterForm = this.fb.group({
      keyword: [''],
      commodityId: [null],
      partFamilyId: [null],
      partMasterId: [null],
      supplierId: [null],
      auditorId: [null],
      stateId: [null],
      cityId: [null],
      statusId: [null],
      fromDate: [null],
      toDate: [null],
      done: [false],
      Archive: [false]
    });
  }

  clearFilters() {

    this.filterForm.reset({
      keyword: '',
      commodityId: null,
      partFamilyId: null,
      partMasterId: null,
      supplierId: null,
      auditorId: null,
      stateId: null,
      cityId: null,
      statusId: null,
      fromDate: null,
      toDate: null,
      Archive: false
    });

    this.getPartsAuidt();
  }
  partsFamilies: any[] = [];
  getPartsFamilies() {
    this._setupService.getPartFamilies(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.partsFamilies = res.data.data;

        }
      });
  }

  parts: any[] = [];
  getParts() {
    this._setupService.getPartMaster(null)
      .subscribe((res: any) => {
        if (res.success) {

          this.parts = res.data.data;

        }
      });
  }
  originalTableData: any[] = [];
  getCommodities() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.originalTableData = res.data;

      }
    });
  }

  Suppliers: any[] = [];
  getSuppliers() {
    this.manageUsersService.getSuppliers()
      .subscribe((res: any) => {
        if (res.success) {

          this.Suppliers = res.data;

        }
      });
  }

  states: any[] = []
  getStates() {
    this._setupService.getAllStates()
      .subscribe((res: any) => {
        if (res.success) {

          this.states = res.data;

        }
      });
  }


  cities: any[] = []
  getCities() {
    this._setupService.getAllCities()
      .subscribe((res: any) => {
        if (res.success) {

          this.cities = res.data;

        }
      });
  }

  Auditors: any[] = [];

  getAuditors() {
    this.manageUsersService.getAllUsers()
      .subscribe((res: any) => {
        if (res.success) {
          this.Auditors = res.data;
          //this.Auditors = res.data.data.filter((user: any) => user.isAuditor === true);
        }
      });
  }


  lookups: any[] = [];

  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 2);
      }
    });
  }
  partsAudits: any[] = [];
  getPartsAuidt() {

    const supplierId = Number(localStorage.getItem('UserId')) || 0;

    const filter = {
      ...this.filterForm.value,
      supplierId: supplierId
    };

    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === ''
      ) {
        delete filter[key];
      }
    });
    console.log('Filter:', filter);

    this.partAuditService.getPartAudits(filter)
      .subscribe((res: any) => {
        if (res.success) {
          this.partsAudits = res.data.data;
          this.totalSize = res.data.toatalRecords;
          this.tableLists = this.partsAudits.slice(this.fromIndex, this.pageSize);
          // this.loadCharts();
          this.loadAuditScoreChart(res.data.data);
        }
      });
  }

  loadAuditScoreChart(audits: any[]): void {

    const latest10 = [...audits]
      .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime())
      .slice(0, 10)
      .reverse(); // oldest → newest left to right on the chart

    const categories = latest10.map(a => this.padId(a.partAuditId));
    const scores = latest10.map(a => a.okayPercentage);

    this.auditScoreChartOptions = {
      ...this.auditScoreChartOptions,
      xAxis: {
        categories,
        title: { text: 'Audit Reference' }
      },
      series: [
        {
          type: 'column',
          name: 'Audit Score',
          data: scores
        }
      ]
    };
  }


  loadPageData() {
    this.fromIndex = this.currentPage * this.pageSize;

    this.tableLists = this.partsAudits.slice(
      this.fromIndex,
      this.fromIndex + this.pageSize
    );
  }
  fnHandlePage(event: any) {

    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadPageData();
  }
  scrollGrid(side: 'left' | 'right') {
    const ele = document.getElementById('table-responsive');
    const scrollAmount = 210; // Adjust this value as needed

    if (ele) {
      // Check if ele is not null
      if (side === 'right') {
        ele.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        ele.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }
  auditScoreChartOptions: Highcharts.Options = {
    chart: {
      type: 'column',
      height: 420
    },

    title: {
      text: 'Latest 10 Parts Audit Scores',
      style: {
        fontSize: '24px',
        color: '#666',
        fontWeight: 'normal'
      }
    },

    credits: {
      enabled: false
    },

    exporting: {
      enabled: true
    },

    xAxis: {
      categories: [
        '254871',
        '254832',
        '254812',
        '254854',
        '254865',
        '254866',
        '254867',
        '254868',
        '254869',
        '254870'
      ],
      title: {
        text: 'Audit Reference'
      }
    },

    yAxis: {
      min: 0,
      max: 100,
      tickInterval: 25,
      title: {
        text: 'Score (%)'
      }
    },

    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom'
    },

    tooltip: {
      pointFormat: '<b>{point.y}%</b>'
    },

    plotOptions: {
      column: {
        pointWidth: 55,
        color: '#2f6fa5',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{y}%',
          style: {
            fontWeight: 'bold',
            color: '#000'
          }
        }
      }
    },

    series: [
      {
        type: 'column',
        name: 'Audit Score',
        data: [87, 80, 90, 75, 95, 82, 88, 79, 91, 94]
      }
    ]
  };

  // Table Data
  auditData = [
    {
      ref: "2024/Process/254871",
      commodity: "Engine Block",
      location: "Chennai",
      supplier: "ABC Castings Pvt Ltd",
      auditor: "Vijay Mohan",
      date: "12-09-2024",
      action: "3/4",
      score: "87 %",
      done: true,
    },
    {
      ref: "2024/Process/254832",
      commodity: "Transmission Case",
      location: "Pune",
      supplier: "XYZ Industries Ltd",
      auditor: "Arjun Sharma",
      date: "05-09-2024",
      action: "3/4",
      score: "80 %",
      done: false,
    },
    {
      ref: "2024/Process/254812",
      commodity: "Cylinder Head",
      location: "Bangalore",
      supplier: "LMN Castings Co",
      auditor: "Radhika Iyer",
      date: "22-08-2024",
      action: "3/4",
      score: "90 %",
      done: false,
    },
    {
      ref: "2024/Process/254854",
      commodity: "Crankshaft",
      location: "Hyderabad",
      supplier: "PQR Castings Ltd",
      auditor: "Siva Kumar",
      date: "30-07-2024",
      action: "3/4",
      score: "75 %",
      done: false,
    },
    {
      ref: "2024/Process/254865",
      commodity: "Camshaft",
      location: "Mumbai",
      supplier: "DEF Automotive Ltd",
      auditor: "Manoj Singh",
      date: "15-07-2024",
      action: "3/4",
      score: "95 %",
      done: true,
    },
  ];






  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault(); // prevents the checkbox from toggling on its own

    const dialogRef = this.dialog.open(AuditDonePopupComponent, {
      width: '480px',
      data: { audit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        audit.done = !audit.done; // only toggle if user confirmed
      }
    });
  }

  openGridView(data: any) {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog'
    });
  }

  defaultColumns: string[] = [
    'Audit Reference',
    'Commodity',
    'Part Family',
    'Part',
    'Supplier',
    'Auditor',
    'State',
    'City',
    'Audit Date',
    'CAPA',
    'Report',
    'Status',
    'Done',
    'Actions'
  ];

  activeColumns: string[] = [];

  frozenCount = 0;
  getColumnWidth(column: string): number {

    const widths: { [key: string]: number } = {

      'Audit Reference': 180,
      'Commodity': 180,
      'Part Family': 180,
      'Part': 180,
      'Supplier': 180,
      'Auditor': 180,
      'State': 150,
      'City': 150,
      'Audit Date': 150,
      'CAPA': 120,
      'Report': 120,
      'Status': 150,
      'Done': 100,
      'Actions': 120

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

        gridType: 'SupplierPartsAuditTable',

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

      gridType: 'SupplierPartsAuditTable'

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
}