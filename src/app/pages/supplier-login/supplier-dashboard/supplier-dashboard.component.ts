import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { SupplierDashboardService } from './supplier-dashboard.service';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  dashboardData: any = null;
  commodities: any[] = [];
  severities: any[] = [];
  years = ['FY 2021-2022', 'FY 2022-2023', 'FY 2023-2024', 'FY 2024-2025', 'FY 2025-2026', 'FY 2026-2027'];

  supplierId: number = 0;
  localProcessCommodityId: number | null = null;
  localPartsCommodityId: number | null = null;

  processChartRef: Highcharts.Chart | null = null;
  partsChartRef: Highcharts.Chart | null = null;
  trendChartRef: Highcharts.Chart | null = null;

  processCallback: Highcharts.ChartCallbackFunction = (chart) => { this.processChartRef = chart; };
  partsCallback: Highcharts.ChartCallbackFunction = (chart) => { this.partsChartRef = chart; };
  trendCallback: Highcharts.ChartCallbackFunction = (chart) => { this.trendChartRef = chart; };

  getBaseOptions(isTrend: boolean = false, color: string = '#6b69a6'): Highcharts.Options {
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined }, 
      colors: isTrend ? ['#6b69a6', '#55c898'] : [color], 
      xAxis: { categories: [], lineColor: '#ccc', tickColor: 'transparent' },
      yAxis: { min: 0, max: 100, title: { text: undefined }, gridLineColor: '#f0f0f0' },
      legend: { 
        layout: 'horizontal', align: 'center', verticalAlign: 'bottom',
        itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
        symbolRadius: 0 
      },
      exporting: { enabled: false },
      credits: { enabled: false },
      plotOptions: { column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } },
      series: isTrend ? [{ type: 'column', name: 'Process Audits', data: [] }, { type: 'column', name: 'Parts Audit', data: [] }] : [{ type: 'column', name: 'Score', data: [] }]
    };
  }

  partsAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#6b69a6');
  processAuditOptions: Highcharts.Options = this.getBaseOptions(false, '#55c898');
  monthlyTrendOptions: Highcharts.Options = this.getBaseOptions(true);

  constructor(private fb: FormBuilder, private api: SupplierDashboardService) {
    this.filterForm = this.fb.group({
      commodityId: [null],
      severityId: [null],
      finYear: ['FY 2026-2027']
    });
  }

  ngOnInit(): void {
    this.supplierId = Number(localStorage.getItem('UserId')) || 0;
    this.loadDropdowns();
    this.loadDashboard();
  }

  loadDropdowns() {
    this.api.getCommodities().subscribe((res: any) => { if (res.success) this.commodities = res.data; });
    this.api.getSeverities().subscribe((res: any) => { if (res.success) this.severities = res.data; });
  }

  loadDashboard() {
    const filters = this.filterForm.value;
    this.localProcessCommodityId = filters.commodityId;
    this.localPartsCommodityId = filters.commodityId;
    
    this.api.getDashboardData(this.supplierId, filters.finYear, filters.commodityId, filters.severityId)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.dashboardData = res.data;
            this.updateCharts(res.data.charts);
          }
        }
      });
  }

  updateCharts(charts: any) {
    if (this.processChartRef && this.processChartRef.series.length > 0) {
      this.processChartRef.xAxis[0].setCategories(charts.processRefs, false);
      this.processChartRef.series[0].setData(charts.processScores, true, false, false);
    }
    if (this.partsChartRef && this.partsChartRef.series.length > 0) {
      this.partsChartRef.xAxis[0].setCategories(charts.partsRefs, false);
      this.partsChartRef.series[0].setData(charts.partsScores, true, false, false);
    }
    if (this.trendChartRef && this.trendChartRef.series.length > 1) {
      this.trendChartRef.xAxis[0].setCategories(charts.trendCategories, false);
      this.trendChartRef.series[0].setData(charts.processMonthly, false, false, false);
      this.trendChartRef.series[1].setData(charts.partsMonthly, true, false, false);
    }
  }

  onFilterSubmit() { this.loadDashboard(); }

  onProcessCommodityChange(commodityId: number | null) {
    this.localProcessCommodityId = commodityId;
    this.api.getProcessChartData(this.supplierId, this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.processChartRef && this.processChartRef.series.length > 0) {
          const chartData = res.data;
          const refs = chartData.refs || chartData.Refs || [];
          const scores = chartData.scores || chartData.Scores || [];
          this.processChartRef.xAxis[0].setCategories(refs, false);
          this.processChartRef.series[0].setData(scores, true, false, false);
        }
      }
    });
  }

  onPartsCommodityChange(commodityId: number | null) {
    this.localPartsCommodityId = commodityId;
    this.api.getPartsChartData(this.supplierId, this.filterForm.value.finYear, commodityId ? commodityId : undefined).subscribe({
      next: (res: any) => {
        if (res.success && this.partsChartRef && this.partsChartRef.series.length > 0) {
          const chartData = res.data;
          const refs = chartData.refs || chartData.Refs || [];
          const scores = chartData.scores || chartData.Scores || [];
          this.partsChartRef.xAxis[0].setCategories(refs, false);
          this.partsChartRef.series[0].setData(scores, true, false, false);
        }
      }
    });
  }
}