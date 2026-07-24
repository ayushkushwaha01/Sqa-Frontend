import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActiveGridDialogComponent } from '../paudits-active-audits/activeaudits-reference/active-grid-dialog/active-grid-dialog.component';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service'; // 🔥 Added this
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component'; // 🔥 Added this
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-paudits-completed-audits',
  templateUrl: './paudits-completed-audits.component.html',
  styleUrls: ['./paudits-completed-audits.component.scss']
})
export class PauditsCompletedAuditsComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;

  private commodityColors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  private auditorColors = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
  private statusColors = ['#6366f1', '#f97316', '#22c55e', '#06b6d4', '#e11d48', '#8b5cf6'];

  private getBaseChartOptions(title: string, colors: string[]): Highcharts.Options {
    return {
      chart: {
        type: 'pie',
        height: 300,
        spacing: [20, 5, 5, 5],
        margin: undefined,
        backgroundColor: 'transparent',
        style: { fontFamily: "'Roboto', 'Helvetica Neue', sans-serif" }
      },
      title: {
        text: title,
        style: {
          color: '#1e293b',
          fontSize: '15px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }
      },
      accessibility: { enabled: false },
      credits: { enabled: false },
      colors: colors,
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'transparent',
        borderRadius: 10,
        style: { color: '#f8fafc', fontSize: '13px', fontWeight: '500' },
        pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
        shadow: true
      },
      plotOptions: {
        pie: {
          innerSize: '50%',
          size: '75%',
          center: ['50%', '50%'],
          borderWidth: 2,
          borderColor: '#ffffff',
          shadow: {
            color: 'rgba(0,0,0,0.06)',
            offsetX: 0,
            offsetY: 2,
            width: 4
          } as any,
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>',
            style: {
              fontSize: '10px',
              fontWeight: '600',
              color: '#475569',
              textOutline: 'none',
              textOverflow: 'ellipsis',
              width: 80
            },
            crop: false,
            overflow: 'allow' as any,
            distance: 18,
            connectorColor: '#94a3b8',
            connectorWidth: 1
          },
          states: {
            hover: {
              halo: { size: 8, attributes: { fill: 'rgba(99,102,241,0.15)' } },
              brightness: 0.08
            }
          },
          allowPointSelect: true,
          cursor: 'pointer',
          slicedOffset: 12
        }
      }
    };
  }

  commodityChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Commodity Distribution', this.commodityColors), series: [{ type: 'pie', name: 'Commodity', data: [] }] } as any;
  auditorChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Auditor Distribution', this.auditorColors), series: [{ type: 'pie', name: 'Auditor', data: [] }] } as any;
  statusChartOptions: Highcharts.Options = { ...this.getBaseChartOptions('Audits Status', this.statusColors), series: [{ type: 'pie', name: 'Status', data: [] }] } as any;

  commodityChartRef: Highcharts.Chart | null = null;
  auditorChartRef: Highcharts.Chart | null = null;
  statusChartRef: Highcharts.Chart | null = null;

  commodityCallback: Highcharts.ChartCallbackFunction = (chart) => { this.commodityChartRef = chart; };
  auditorCallback: Highcharts.ChartCallbackFunction = (chart) => { this.auditorChartRef = chart; };
  statusCallback: Highcharts.ChartCallbackFunction = (chart) => { this.statusChartRef = chart; };

  // API Data
  completedAuditData: any[] = [];
  statusLookups: any[] = [];

  // Pagination
  pageSize = 5;
  pageIndex = 0;

  // Filter variables
  originalAuditData: any[] = [];
  filteredAuditData: any[] = [];
  filterToggle = false;
  filterForm!: FormGroup;

  get uniqueCommodities() { return [...new Set(this.originalAuditData.map(a => a.commodityName).filter(Boolean))].sort(); }
  get uniqueStates() { return [...new Set(this.originalAuditData.map(a => a.stateName).filter(Boolean))].sort(); }
  get uniqueCities() { return [...new Set(this.originalAuditData.map(a => a.cityName).filter(Boolean))].sort(); }
  get uniqueSuppliers() { return [...new Set(this.originalAuditData.map(a => a.supplierName).filter(Boolean))].sort(); }

  get pagedAuditData() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredAuditData.slice(start, start + this.pageSize);
  }

  constructor(
    private dialog: MatDialog, 
    private api: ProcessAuditService,
    private alertService: AlertService, // 🔥 Injected AlertService
    private fb: FormBuilder
  ) { 
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: [null],
      Commodity: [null],
      State: [null],
      City: [null],
      Supplier: [null]
    });
  }

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.statusLookups = res.data.filter((l: any) => l.codeMasterName === 'Audit-Status');
      }
      this.loadData();
    });
  }

  loadData() {
    this.api.getAllAudits().subscribe((res: any) => {
      if (res.success) {
        // ONLY keep records where isDone is true
        this.completedAuditData = res.data.filter((a: any) => a.isDone === true);
        this.originalAuditData = [...this.completedAuditData];
        this.filteredAuditData = [...this.completedAuditData];
        
        // If the current page becomes empty after unticking an item, go back one page
        const maxPage = Math.ceil(this.filteredAuditData.length / this.pageSize) - 1;
        if (this.pageIndex > maxPage && this.pageIndex > 0) {
           this.pageIndex = maxPage;
        }

        this.updateCharts();
      }
    });
  }

  // Helper to display read-only status text
  getStatusName(statusId: number): string {
    const status = this.statusLookups.find(s => s.lookupId === statusId);
    return status ? status.lookupName : 'N/A';
  }

  updateCharts() {
    const getCounts = (key: string) => {
      return this.completedAuditData.reduce((acc: any, curr: any) => {
        const name = curr[key] || 'Unassigned';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
    };

    const commodityCounts = getCounts('commodityName');
    const auditorCounts = getCounts('auditorName');

    const statusCounts = this.completedAuditData.reduce((acc: any, curr: any) => {
      const name = this.getStatusName(curr.statusId);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const formatData = (counts: any) => Object.keys(counts).map(k => ({ name: k, y: counts[k] }));

    if (this.commodityChartRef && this.commodityChartRef.series.length > 0) {
      this.commodityChartRef.series[0].setData(formatData(commodityCounts), true, false, false);
    }
    if (this.auditorChartRef && this.auditorChartRef.series.length > 0) {
      this.auditorChartRef.series[0].setData(formatData(auditorCounts), true, false, false);
    }
    if (this.statusChartRef && this.statusChartRef.series.length > 0) {
      this.statusChartRef.series[0].setData(formatData(statusCounts), true, false, false);
    }
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openGridView() {
    this.dialog.open(ActiveGridDialogComponent, {
      width: '650px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'no-scroll-dialog' 
    });
  }

  filter() {
    const keyword = this.filterForm.value.Keyword?.toLowerCase() || '';
    const statusId = this.filterForm.value.Status;
    const commodity = this.filterForm.value.Commodity;
    const state = this.filterForm.value.State;
    const city = this.filterForm.value.City;
    const supplier = this.filterForm.value.Supplier;

    this.filteredAuditData = this.originalAuditData.filter((item: any) => {
      let matchesKeyword = true;
      let matchesStatus = true;
      let matchesCommodity = true;
      let matchesState = true;
      let matchesCity = true;
      let matchesSupplier = true;

      if (keyword) {
        matchesKeyword = 
          (item.auditReference && item.auditReference.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.auditorName && item.auditorName.toLowerCase().includes(keyword)) ||
          (item.commodityName && item.commodityName.toLowerCase().includes(keyword));
      }

      if (statusId) { matchesStatus = item.statusId === statusId; }
      if (commodity) { matchesCommodity = item.commodityName === commodity; }
      if (state) { matchesState = item.stateName === state; }
      if (city) { matchesCity = item.cityName === city; }
      if (supplier) { matchesSupplier = item.supplierName === supplier; }

      return matchesKeyword && matchesStatus && matchesCommodity && matchesState && matchesCity && matchesSupplier;
    });
    this.pageIndex = 0; // Reset to first page on filter
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredAuditData = [...this.originalAuditData];
    this.pageIndex = 0; // Reset to first page
  }

  // 🔥 Re-added standard Done Click functionality
  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault(); 

    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: {
        title: 'Confirm Action',
        content: audit.isDone
          ? 'Are you sure you want to mark this audit as Not Done? It will be moved back to Active Audits.'
          : 'Are you sure you want to mark this audit as Done?',
        isConfirmation: true
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        audit.isDone = !audit.isDone;
        this.api.upsertAudit(audit).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(
                audit.isDone ? 'Audit marked as Done' : 'Audit moved back to Active Audits', 1
              );
              this.loadData(); // 🔥 Refresh data to instantly remove it from this grid
            } else {
              audit.isDone = !audit.isDone; 
              this.alertService.createAlert(res.message || 'Failed to update', 0);
            }
          },
          error: () => {
            audit.isDone = !audit.isDone; 
            this.alertService.createAlert('Error updating audit', 0);
          }
        });
      }
    });
  }

  // --- GRID SCROLLING ---
  scrollRight() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
  }
  
  scrollLeft() {
    const container = document.getElementById('grid-table-container');
    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
  }
}