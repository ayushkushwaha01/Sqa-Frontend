import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { ProcessAnalyticsService } from '../process-analytics.service';
import { ProcessAuditService } from '../../process-audit.service';

@Component({
  selector: 'app-analytics-pareto',
  templateUrl: './analytics-pareto.component.html',
  styleUrls: ['./analytics-pareto.component.scss']
})
export class AnalyticsParetoComponent implements OnInit, AfterViewInit {

  Highcharts: typeof Highcharts = Highcharts;
  filterForm!: FormGroup;
  commodities: any[] = [];

  // Table Data Arrays
  pareto: any[] = [];         // Critical NC by Process Category
  statusList: any[] = [];     // Important NC by Process Category
  criticalList: any[] = [];   // Critical & Important NC by Commodity

  // Pie Chart Configurations
  commodityPieOptions: Highcharts.Options = {};
  statusPieOptions: Highcharts.Options = {};
  criticalPieOptions: Highcharts.Options = {};

  private pieColors = ['#87ceeb', '#008000', '#ff0000', '#ffff00', '#0000ff', '#8b5cf6', '#f97316'];

  constructor(
    private fb: FormBuilder,
    private analyticsService: ProcessAnalyticsService,
    private auditService: ProcessAuditService
  ) {
    const currentYear = new Date().getFullYear().toString();

    this.filterForm = this.fb.group({
      commodityId: [null],
      year: [currentYear]
    });
  }

  ngOnInit(): void {
    this.initEmptyCharts();
    this.loadCommodities();
    this.loadParetoData();
  }

  loadCommodities(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res.success) {
        this.commodities = res.data;
      }
    });
  }

  loadParetoData(): void {
    const { commodityId, year } = this.filterForm.value;

    this.analyticsService.getParetoAnalytics(commodityId, Number(year)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // 1. Assign Table Data
          this.pareto = res.data.criticalByCategory || [];
          this.statusList = res.data.importantByCategory || [];
          this.criticalList = res.data.criticalAndImportantByCommodity || [];

          // 2. Update all 3 Highcharts Pie Charts
          this.commodityPieOptions = this.buildPieOptions(this.pareto);
          this.statusPieOptions = this.buildPieOptions(this.statusList);
          this.criticalPieOptions = this.buildPieOptions(this.criticalList);
        }
      },
      error: () => console.error('Failed to load Pareto analytics data')
    });
  }

  // Converts [{name: 'OPM', action: 5}] into Highcharts Pie Series
  private buildPieOptions(dataList: any[]): Highcharts.Options {
    const seriesData = dataList.map((item, index) => ({
      name: item.name,
      y: Number(item.action),
      color: this.pieColors[index % this.pieColors.length]
    }));

    return {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: { text: '' },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.0f}%'
          },
          showInLegend: false
        }
      },
      series: [{
        type: 'pie',
        name: 'CAPAs',
        data: seriesData
      }]
    };
  }

  initEmptyCharts(): void {
    this.commodityPieOptions = this.buildPieOptions([]);
    this.statusPieOptions = this.buildPieOptions([]);
    this.criticalPieOptions = this.buildPieOptions([]);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }
}