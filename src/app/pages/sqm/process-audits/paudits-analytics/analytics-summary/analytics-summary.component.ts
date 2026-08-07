import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { ProcessAnalyticsService } from '../process-analytics.service';
import { ProcessAuditService } from '../../process-audit.service';
 
@Component({
  selector: 'app-analytics-summary',
  templateUrl: './analytics-summary.component.html',
  styleUrls: ['./analytics-summary.component.scss']
})
export class AnalyticsSummaryComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;

  commodities: any[] = [];
  auditors: any[] = [];

  tableData = {
    checked: 0,
    nc: 0,
    safety: 0,
    critical: 0,
    important: 0,
    fitment: 0,
    regular: 0
  };

  private piePlotOptions: Highcharts.Options['plotOptions'] = {
    pie: {
      size: '80%',
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
        distance: 15
      },
      showInLegend: false
    }
  };

  distributionByClassOptions: Highcharts.Options = {};
  issuesCorrectedOptions: Highcharts.Options = {};
  pdcaDistributionOptions: Highcharts.Options = {};

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService,
    private auditService: ProcessAuditService
  ) {
    const currentYear = new Date().getFullYear().toString();

    this.filterForm = this.fb.group({
      commodityId: [null],
      auditorId: [null],
      year: [currentYear],
      month: [null]
    });
  }

  ngOnInit(): void {
    this.initEmptyCharts();
    this.loadDropdowns();
    this.loadSummaryData();
  }

  loadDropdowns(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res.success) this.commodities = res.data;
    });

    this.auditService.getUsers().subscribe((res: any) => {
      if (res.success) {
        this.auditors = res.data.filter((u: any) => u.isAuditor === true);
      }
    });
  }

  onSearch(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    const { commodityId, auditorId, year, month } = this.filterForm.value;

    this.analyticsService.getSummaryAnalytics(commodityId, auditorId, Number(year), Number(month)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // 1. Update Table
          const t = res.data.tableData;
          this.tableData = {
            checked: t.checked,
            nc: t.nc,
            safety: t.safety,
            critical: t.critical,
            important: t.important,
            fitment: t.fitment,
            regular: t.regular
          };

          // 2. Update Charts
          this.distributionByClassOptions = this.buildPieChart('Distribution by Class', res.data.classDistribution);
          this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', res.data.issuesCorrected);
          this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', res.data.pdcaDistribution);
        }
      },
      error: () => console.error('Failed to load Summary analytics')
    });
  }

  private buildPieChart(title: string, dataPoints: any[]): Highcharts.Options {
    return {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: title },
      credits: { enabled: false },
      tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}% ({point.y} items)</b>' },
      plotOptions: this.piePlotOptions,
      series: [{
        type: 'pie',
        name: 'CAPAs',
        data: dataPoints.length > 0 ? dataPoints : [{ name: 'No Data', y: 1, color: '#e0e0e0' }]
      }]
    };
  }

  initEmptyCharts(): void {
    this.distributionByClassOptions = this.buildPieChart('Distribution by Class', []);
    this.issuesCorrectedOptions = this.buildPieChart('Issues Corrected', []);
    this.pdcaDistributionOptions = this.buildPieChart('PDCA Distribution', []);
  }
}