import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as Highcharts from 'highcharts';
import { PauditsNewAuditComponent } from '../paudits-new-audit/paudits-new-audit.component';
import { ProcessAuditService } from '../process-audit.service';
import { AlertService } from 'src/app/shared/alert.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { StatusChangeComponent } from 'src/app/status-change/status-change.component';

@Component({
  selector: "app-paudits-active-audits",
  templateUrl: "./paudits-active-audits.component.html",
  styleUrls: ["./paudits-active-audits.component.scss"]
})
export class PauditsActiveAuditsComponent implements OnInit, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;
  private isDestroyed = false;
  
  auditData: any[] = [];
  originalAuditData: any[] = [];
  filteredAuditData: any[] = [];
  statusLookups: any[] = [];
  filterToggle = false;
  maskDone = false;
  filterForm!: FormGroup;

  // Pagination properties
  pageSize = 20;
  pageIndex = 0;

  // Helper arrays for filter dropdowns
  get uniqueCommodities() { return [...new Set(this.originalAuditData.map(a => a.commodityName).filter(Boolean))].sort(); }
  get uniqueStates() { return [...new Set(this.originalAuditData.map(a => a.stateName).filter(Boolean))].sort(); }
  get uniqueCities() { 
    const selectedState = this.filterForm?.value?.State;
    let data = this.originalAuditData;
    if (selectedState) {
      data = data.filter(a => a.stateName === selectedState);
    }
    return [...new Set(data.map(a => a.cityName).filter(Boolean))].sort(); 
  }
  get uniqueSuppliers() { return [...new Set(this.originalAuditData.map(a => a.supplierName).filter(Boolean))].sort(); }
  get uniqueStages() { return [...new Set(this.originalAuditData.map(a => a.stageName).filter(Boolean))].sort(); }
  get uniqueAuditors() { return [...new Set(this.originalAuditData.map(a => a.auditorName).filter(Boolean))].sort(); }

  get pagedAuditData() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredAuditData.slice(start, start + this.pageSize);
  }

  // ==========================================
  // --- PREMIUM COLOR PALETTES ---
  // ==========================================
  private commodityColors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  private auditorColors = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#ec4899', '#14b8a6'];
  private statusColors = ['#6366f1', '#f97316', '#22c55e', '#06b6d4', '#e11d48', '#8b5cf6'];

  // ==========================================
  // --- HIGHCHARTS CONFIGURATIONS ---
  // ==========================================

  // Shared chart style helper
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

  // Pie Chart 1: Commodity Distribution
  commodityChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Commodity Distribution', this.commodityColors),
    series: [{
      type: 'pie',
      name: 'Commodity',
      data: [
        { name: 'Casting', y: 25 },
        { name: 'Forging', y: 15 },
        { name: 'Machining', y: 20 },
        { name: 'Fasteners', y: 15 },
        { name: 'Non-Metallic', y: 15 },
        { name: 'Sheet Metal', y: 10 },
      ],
    }],
    _originalTitle: 'Commodity Distribution'
  } as any;

  // Pie Chart 2: Auditor Distribution
  auditorChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Auditor Distribution', this.auditorColors),
    series: [{
      type: 'pie',
      name: 'Auditor',
      data: [
        { name: 'Ramesh Kumar', y: 25 },
        { name: 'Suresh Singh', y: 25 },
        { name: 'Sagar Kumar', y: 25 },
        { name: 'Mahesh Kumar', y: 25 }
      ]
    }],
    _originalTitle: 'Auditor Distribution'
  } as any;

  // Pie Chart 3: Audits Status
  statusChartOptions: Highcharts.Options = {
    ...this.getBaseChartOptions('Audits Status', this.statusColors),
    series: [{
      type: 'pie',
      name: 'Status',
      data: [
        { name: 'Hold', y: 25 },
        { name: 'WIP', y: 25 },
        { name: 'Completed', y: 25 },
        { name: 'Pending', y: 25 },
      ],
    }],
    _originalTitle: 'Audits Status'
  } as any;

  // ==========================================
  // --- EXISTING COMPONENT LOGIC ---
  // ==========================================

  constructor(
    private dialog: MatDialog,
    private api: ProcessAuditService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      Keyword: [''],
      Status: [null],
      Stage: [null],
      Auditor: [null],
      FromDate: [null],
      ToDate: [null],
      Commodity: [null],
      State: [null],
      City: [null],
      Supplier: [null]
    });
  }

  ngOnInit(): void {
    this.loadLookups();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  loadLookups() {
    this.api.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.statusLookups = res.data.filter((l: any) => l.codeMasterName === 'Audit-Status');
      }
      // Load data AFTER lookups are ready so status chart maps correctly
      this.loadData();
    });
  }

  loadData() {
    this.api.getAllAudits().subscribe((res: any) => {
      if (res.success) {
        this.auditData = res.data;
        this.originalAuditData = [...res.data];
        // Re-apply active filters (including maskDone) after reload
        this.filter();
        this.updateCharts();
      }
    });
  }

  onStateChange() {
    this.filterForm.get('City')?.setValue(null);
  }

  filter() {
    const keyword = this.filterForm.value.Keyword?.toLowerCase() || '';
    const commodity = this.filterForm.value.Commodity;
    const state = this.filterForm.value.State;
    const city = this.filterForm.value.City;
    const supplier = this.filterForm.value.Supplier;
    const stage = this.filterForm.value.Stage;
    const auditor = this.filterForm.value.Auditor;
    const fromDate = this.filterForm.value.FromDate;
    const toDate = this.filterForm.value.ToDate;

    this.filteredAuditData = this.originalAuditData.filter((item: any) => {
      let matchesKeyword = true;
      let matchesCommodity = true;
      let matchesState = true;
      let matchesCity = true;
      let matchesSupplier = true;
      let matchesStage = true;
      let matchesAuditor = true;
      let matchesDate = true;

      if (keyword) {
        matchesKeyword = 
          (item.auditReference && item.auditReference.toLowerCase().includes(keyword)) ||
          (item.supplierName && item.supplierName.toLowerCase().includes(keyword)) ||
          (item.auditorName && item.auditorName.toLowerCase().includes(keyword)) ||
          (item.commodityName && item.commodityName.toLowerCase().includes(keyword)) ||
          (item.stateName && item.stateName.toLowerCase().includes(keyword)) ||
          (item.cityName && item.cityName.toLowerCase().includes(keyword));
      }

      if (commodity) { matchesCommodity = item.commodityName === commodity; }
      if (state) { matchesState = item.stateName === state; }
      if (city) { matchesCity = item.cityName === city; }
      if (supplier) { matchesSupplier = item.supplierName === supplier; }
      if (stage) { matchesStage = item.stageName === stage; }
      if (auditor) { matchesAuditor = item.auditorName === auditor; }

      if (fromDate || toDate) {
        const auditDate = new Date(item.auditDate);
        auditDate.setHours(0, 0, 0, 0); // normalize time
        
        if (fromDate) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          if (auditDate < start) matchesDate = false;
        }
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(0, 0, 0, 0);
          if (auditDate > end) matchesDate = false;
        }
      }

      return matchesKeyword && matchesCommodity && matchesState && matchesCity && matchesSupplier && matchesStage && matchesAuditor && matchesDate;
    });

    // Apply maskDone filter
    if (this.maskDone) {
      this.filteredAuditData = this.filteredAuditData.filter(item => !item.isDone);
    }

    this.pageIndex = 0; // Reset to first page on filter
    this.updateCharts();
  }

  clearFilter() {
    this.filterForm.reset();
    this.filteredAuditData = [...this.originalAuditData];
    if (this.maskDone) {
      this.filteredAuditData = this.filteredAuditData.filter(item => !item.isDone);
    }
    const maxPage = Math.max(0, Math.ceil(this.filteredAuditData.length / this.pageSize) - 1);
    if (this.pageIndex > maxPage) {
      this.pageIndex = maxPage;
    }
    this.updateCharts();
  }

  onMaskDoneChange() {
    this.filter();
  }

  // Chart references for direct native updates (bypasses Gantt bugs in chart.update)
  commodityChartRef: Highcharts.Chart | null = null;
  auditorChartRef: Highcharts.Chart | null = null;
  statusChartRef: Highcharts.Chart | null = null;

  commodityCallback: Highcharts.ChartCallbackFunction = (chart) => { this.commodityChartRef = chart; };
  auditorCallback: Highcharts.ChartCallbackFunction = (chart) => { this.auditorChartRef = chart; };
  statusCallback: Highcharts.ChartCallbackFunction = (chart) => { this.statusChartRef = chart; };

  updateCharts() {
    if (this.isDestroyed) return;
    const getCounts = (key: string) => {
      return this.filteredAuditData.reduce((acc: any, curr: any) => {
        const name = curr[key] || 'Unassigned';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
    };

    const commodityCounts = getCounts('commodityName');
    const auditorCounts = getCounts('auditorName');

    const statusCounts = this.filteredAuditData.reduce((acc: any, curr: any) => {
      const statusObj = this.statusLookups.find(l => l.lookupId === curr.statusId);
      const name = statusObj ? statusObj.lookupName : 'Pending/None';
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

  openaudit(item: any = null) {
    let dialogRef = this.dialog.open(PauditsNewAuditComponent, {
      width: '600px',
      height: 'auto',
      data: item
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) this.loadData();
    });
  }

  onStatusChange(audit: any) {
    this.api.upsertAudit(audit).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alertService.createAlert('Status updated successfully', 1);
          this.loadData();
        } else {
          this.alertService.createAlert(res.message || 'Failed to update status', 0);
          this.loadData(); 
        }
      },
      error: () => {
        this.alertService.createAlert('Error updating status', 0);
        this.loadData();
      }
    });
  }

  onDoneClick(event: MouseEvent, audit: any): void {
    event.preventDefault(); 

    let dialogRef = this.dialog.open(StatusChangeComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      disableClose: true,
      data: {
        title: 'Confirm Action',
        content: audit.isDone
          ? 'Are you sure you want to mark this audit as Not Done?'
          : 'Are you sure you want to mark this audit as Done?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        audit.isDone = !audit.isDone;
        this.api.upsertAudit(audit).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(
                audit.isDone ? 'Audit marked as Done' : 'Audit marked as Not Done', 1
              );
              // Re-apply filter so maskDone hides the row immediately
              if (this.maskDone) {
                this.filter();
              }
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

  deleteAudit(audit: any) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      panelClass: 'no-padding-dialog',
      data: { title: 'Delete Confirmation', content: 'Are you sure you want to Delete this Audit?', isConfirmation: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.api.deleteAudit(audit).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alertService.createAlert(res.message || 'Audit deleted successfully', 1);
              this.loadData();
            } else {
              this.alertService.createAlert(res.message || 'Failed to delete audit', 0);
            }
          },
          error: () => this.alertService.createAlert('Error deleting audit', 0)
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


  // Add this method to your PauditsActiveAuditsComponent class
isFullyResolved(audit: any): boolean {
    if (!audit.capaSummary || audit.capaSummary === '-') return true;
    
    // Split the "2/10" string into [2, 10]
    const parts = audit.capaSummary.split('/');
    if (parts.length !== 2) return false;
    
    const resolved = parseInt(parts[0]);
    const total = parseInt(parts[1]);
    
    // Return true only if total is greater than 0 and resolved equals total
    return total > 0 && resolved === total;
}

  ngOnDestroy(): void {
    this.isDestroyed = true;
    // Safely destroy chart references to prevent Highcharts 'columns' error
    try {
      if (this.commodityChartRef) {
        this.commodityChartRef.destroy();
        this.commodityChartRef = null;
      }
    } catch (e) { }
    try {
      if (this.auditorChartRef) {
        this.auditorChartRef.destroy();
        this.auditorChartRef = null;
      }
    } catch (e) { }
    try {
      if (this.statusChartRef) {
        this.statusChartRef.destroy();
        this.statusChartRef = null;
      }
    } catch (e) { }
  }
}