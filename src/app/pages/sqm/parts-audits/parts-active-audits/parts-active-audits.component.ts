import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as  Highcharts from 'highcharts';
import { NewAuditComponent } from '../new-audit/new-audit.component';
import { ActiveGridDialogComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { AuditDonePopupComponent } from '../../process-audits/paudits-active-audits/activeaudits-reference/active-grid-dialog/audit-done-popup/audit-done-popup.component';
import { PartAuditService } from '../part-audit.service';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { SetupService } from 'src/app/pages/setup/setup.service';
import { CommodityService } from '../../process-audits/paudits-setup/commodity-master/commodity.service';
import { ManageUsersService } from 'src/app/pages/admin/manage-user/manage-users.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { ColumnSelectorComponent } from 'src/app/pages/column-selector/column-selector.component';

@Component({
  selector: 'app-parts-active-audits',
  templateUrl: './parts-active-audits.component.html',
  styleUrls: ['./parts-active-audits.component.scss']
})
export class PartsActiveAuditsComponent implements OnInit {

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
      toDate: [null]
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
      toDate: null
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

    const filter = { ...this.filterForm.value };

    Object.keys(filter).forEach(key => {
      if (
        filter[key] === null ||
        filter[key] === undefined ||
        filter[key] === ''
      ) {
        delete filter[key];
      }
    });

    this.partAuditService.getPartAudits(filter)
      .subscribe((res: any) => {
        if (res.success) {
          this.partsAudits = res.data.data;
          this.totalSize = res.data.toatalRecords;
          this.tableLists = this.partsAudits.slice(this.fromIndex, this.pageSize);
          this.loadCharts();
        }
      });
  }

  loadCharts() {
    this.bindCommodityChart();
    this.bindAuditorChart();
    this.bindStatusChart();
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



  changeStatus(audit: any) {

    const obj = {
      partAuditId: audit.partAuditId,
      statusId: audit.statusId
    };

    this.partAuditService.updatePartAuditStatus(obj)
      .subscribe((res: any) => {

        if (res.success) {
          this.alertService.createAlert(res.message, 1);
          this.getPartsAuidt();
        } else {
          this.alertService.createAlert(res.message, 0);
        }

      });

  }


  deleteConfirmation(item: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: 'auto',
      data: { component: null, title: 'Delete Confirmation', content: 'Are you sure you want to Delete?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.partAuditService.DeletePartAudit(item).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              this.getPartsAuidt();
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
  }



  bindCommodityChart() {

    const counts: any = {};

    this.partsAudits.forEach((x: any) => {
      const key = x.commodityName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a: any, b: any) => b[1] - a[1]);

    const topFive = sorted.slice(0, 5);

    const othersCount = sorted
      .slice(5)
      .reduce((sum: number, item: any) => sum + item[1], 0);

    const chartData: any[] = topFive.map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    if (othersCount > 0) {
      chartData.push({
        name: 'Others',
        y: othersCount
      });
    }

    this.commodityChartOptions = {
      ...this.commodityChartOptions,
      series: [{
        type: 'pie',
        name: 'Commodity',
        data: chartData
      }]
    };
  }

  bindAuditorChart() {

    const counts: any = {};

    this.partsAudits.forEach((x: any) => {
      const key = x.auditorName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a: any, b: any) => b[1] - a[1]);

    const topFive = sorted.slice(0, 5);

    const othersCount = sorted
      .slice(5)
      .reduce((sum: number, item: any) => sum + item[1], 0);

    const chartData: any[] = topFive.map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    if (othersCount > 0) {
      chartData.push({
        name: 'Others',
        y: othersCount
      });
    }

    this.auditorChartOptions = {
      ...this.auditorChartOptions,
      series: [{
        type: 'pie',
        name: 'Auditor',
        data: chartData
      }]
    };
  }

  bindStatusChart() {

    const counts: any = {};

    this.partsAudits.forEach((x: any) => {
      const key = x.statusName || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    const chartData = Object.entries(counts).map((x: any) => ({
      name: x[0],
      y: x[1]
    }));

    this.statusChartOptions = {
      ...this.statusChartOptions,
      series: [{
        type: 'pie',
        name: 'Status',
        data: chartData
      }]
    };
  }





  changeDoneStatus(item: any) {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: {
        component: null,
        title: 'Change Status Confirmation',
        content: `Are you sure you want to mark this record as ${item.done ? 'Not Done' : 'Done'}?`,
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        const payload = { ...item, done: !item.done };
        this.partAuditService.updatePartAuditDoneStatus(payload).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message, 1);
              item.done = !item.done; // update local state instead of full reload
            } else {
              this.alertService.createAlert(res.message, 0);
            }
          }
        });
      }
    });
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

  // Pie Chart 1: Commodity Distribution
  commodityChartOptions: Highcharts.Options = {
    chart: { type: 'pie', height: 300, spacing: [10, 10, 10, 10] },
    title: { text: 'Commodity Distribution', style: { color: '#666', fontSize: '18px' } },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        size: '80%',
        innerSize: '0%',
        dataLabels: { enabled: true, format: '{point.name}', style: { fontWeight: 'normal', color: '#666' } }
      }
    },
    series: [
      {
        type: "pie",
        name: "Commodity",
        data: [
          { name: "Casting", y: 25, color: "#3f51b5" },
          { name: "Forging", y: 15, color: "#e53935" },
          { name: "Machining", y: 20, color: "#4caf50" },
          { name: "Fasteners", y: 15, color: "#00acc1" },
          { name: "Non-Metall...", y: 15, color: "#fb8c00" },
          { name: "Sheet Meta...", y: 10, color: "#757575" },
        ],
      },
    ],
  };

  // Pie Chart 2: Auditor Distribution
  auditorChartOptions: Highcharts.Options = {
    chart: { type: "pie", height: 300 },
    title: {
      text: "Auditor Distribution",
      style: { color: "#666", fontSize: "18px" },
    },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        size: '80%',        // fixes radius consistency
        innerSize: '0%',   // donut style, same across charts
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: { fontWeight: 'normal', color: '#666' }
        }
      }
    }
    ,
    series: [{
      type: 'pie',
      name: 'Auditor',
      data: [
        { name: 'Ramesh Kum...', y: 25, color: '#3f51b5' },
        { name: 'Suresh Sin...', y: 25, color: '#e53935' },
        { name: 'Sagar Kuma...', y: 25, color: '#4caf50' },
        { name: 'Mahesh Kum...', y: 25, color: '#00acc1' }
      ]
    }]
  };

  // Pie Chart 3: Audits Status
  statusChartOptions: Highcharts.Options = {
    chart: { type: "pie", height: 300 },
    title: {
      text: "Audits Status",
      style: { color: "#666", fontSize: "18px" },
    },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        size: '80%',        // fixes radius consistency 
        innerSize: '0%',
        dataLabels: { enabled: true, format: '{point.name}', style: { fontWeight: 'normal', color: '#666' } }
      }
    },
    series: [
      {
        type: "pie",
        name: "Status",
        data: [
          { name: "Hold", y: 25, color: "#3f51b5" },
          { name: "WIP", y: 25, color: "#e53935" },
          { name: "Completed", y: 25, color: "#4caf50" },
          { name: "Pending", y: 25, color: "#00acc1" },
        ],
      },
    ],
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






  openaudit(data: any) {
    const dialogRef = this.dialog.open(NewAuditComponent, {
      width: '600px',
      height: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getPartsAuidt();
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
    'Manage'
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
      'Manage': 120

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

        gridType: 'PartsAuditTable',

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

      gridType: 'PartsAuditTable'

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
