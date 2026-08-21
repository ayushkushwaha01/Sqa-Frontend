import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { SqmDashboardService } from './sqm-dashboard.service';
import { UserPermissionService } from '../../helpers/user-permission.service';

@Component({
  selector: 'app-sqm-dashboard',
  templateUrl: './sqm-dashboard.component.html',
  styleUrls: ['./sqm-dashboard.component.scss']
})
export class SqmDashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  // Data bindings
  dashboardData: any = null;
  commodities: any[] = [];
  severities: any[] = [];
  years = ['FY 2021-2022', 'FY 2022-2023', 'FY 2023-2024', 'FY 2024-2025', 'FY 2025-2026', 'FY 2026-2027'];

  // Local widget filter selections
  localProcessCommodityId: number | null = null;
  localPartsCommodityId: number | null = null;

  // NATIVE CHART REFERENCES
  processChartRef: Highcharts.Chart | null = null;
  partsChartRef: Highcharts.Chart | null = null;
  trendChartRef: Highcharts.Chart | null = null;

  // NATIVE CALLBACKS
  processCallback: Highcharts.ChartCallbackFunction = (chart) => { this.processChartRef = chart; };
  partsCallback: Highcharts.ChartCallbackFunction = (chart) => { this.partsChartRef = chart; };
  trendCallback: Highcharts.ChartCallbackFunction = (chart) => { this.trendChartRef = chart; };

  // BASE CONFIGURATION
  getBaseOptions(isTrend: boolean = false): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined },
      colors: ['#6b69a6', '#55c898'],
      xAxis: {
        categories: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
        lineColor: '#ccc',
        tickColor: 'transparent'
      },
      yAxis: {
        min: 0,
        title: { text: undefined },
        gridLineColor: '#f0f0f0'
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
        symbolRadius: 0
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } },
      series: isTrend
        ? [{ type: 'column', name: 'Process Audits', data: [] }, { type: 'column', name: 'Parts Audit', data: [] }]
        : [{ type: 'column', name: 'Actual', data: [] }]
    };
  }

  // Initialize options
  partsAuditOptions: Highcharts.Options = this.getBaseOptions();
  processAuditOptions: Highcharts.Options = this.getBaseOptions();
  monthlyTrendOptions: Highcharts.Options = this.getBaseOptions(true);

  constructor(private fb: FormBuilder, private api: SqmDashboardService) {
    this.filterForm = this.fb.group({
      commodityId: [null],
      severityId: [null],
      finYear: ['FY 2026-2027']
    });
  }

  canRead: boolean = false;
  readonly SCREEN_ID: number = 1; // Screen ID for Process Analytics

  ngOnInit(): void {
    this.canRead = UserPermissionService.fnGetReadPermissions(this.SCREEN_ID);
    if (!this.canRead) return;
    this.loadDropdowns();
    this.loadDashboard();
  }

  loadDropdowns() {
    this.api.getCommodities().subscribe((res: any) => {
      if (res.success) this.commodities = res.data;
    });
    this.api.getSeverities().subscribe((res: any) => {
      if (res.success) this.severities = res.data;
    });
  }

  loadDashboard() {
    const filters = this.filterForm.value;

    // Sync the local widget dropdowns with the global filter selection
    this.localProcessCommodityId = filters.commodityId;
    this.localPartsCommodityId = filters.commodityId;

    this.api.getDashboardData(filters.finYear, filters.commodityId, filters.severityId)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.dashboardData = res.data;
            this.updateCharts(res.data.charts);
          }
        },
        error: (err) => console.error("Failed to load dashboard data", err)
      });
  }

  // DIRECT DATA INJECTION (Bypasses Angular wrapper bugs)
  updateCharts(chartsData: any) {
    if (this.processChartRef && this.processChartRef.series.length > 0) {
      this.processChartRef.series[0].setData(chartsData.processAudits, true, false, false);
    }

    if (this.partsChartRef && this.partsChartRef.series.length > 0) {
      this.partsChartRef.series[0].setData(chartsData.partsAudits, true, false, false);
    }

    if (this.trendChartRef && this.trendChartRef.series.length > 1) {
      this.trendChartRef.xAxis[0].setCategories(chartsData.trendCategories, false);
      this.trendChartRef.series[0].setData(chartsData.processMonthly, false, false, false);
      this.trendChartRef.series[1].setData(chartsData.partsMonthly, true, false, false);
    }
  }

  onFilterSubmit() {
    this.loadDashboard();
  }

  // --- LOCAL WIDGET FILTER EVENTS ---

  onProcessCommodityChange(commodityId: number | null) {
    this.localProcessCommodityId = commodityId;
    const finYear = this.filterForm.value.finYear;

    this.api.getProcessChartData(finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.processChartRef && this.processChartRef.series.length > 0) {
          this.processChartRef.series[0].setData(res.data, true, false, false);
        }
      }
    });
  }

  onPartsCommodityChange(commodityId: number | null) {
    this.localPartsCommodityId = commodityId;
    const finYear = this.filterForm.value.finYear;

    this.api.getPartsChartData(finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.partsChartRef && this.partsChartRef.series.length > 0) {
          this.partsChartRef.series[0].setData(res.data, true, false, false);
        }
      }
    });
  }
}