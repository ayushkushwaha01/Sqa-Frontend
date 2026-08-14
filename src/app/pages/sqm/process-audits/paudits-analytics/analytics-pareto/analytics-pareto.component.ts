import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { finalize } from 'rxjs/operators';
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
  isLoading: boolean = false;

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

  clearFilter(): void {
    const currentYear = new Date().getFullYear().toString();
    this.filterForm.reset({
      commodityId: null,
      year: currentYear
    });
    this.loadParetoData();
  }

  loadCommodities(): void {
    this.auditService.getCommodities().subscribe((res: any) => {
      if (res && res.success) {
        this.commodities = res.data || [];
      }
    });
  }

  // loadParetoData(): void {
  //   if (this.isLoading) return;
  //   this.isLoading = true;
  //   const { commodityId, year } = this.filterForm.value;

  //   this.analyticsService.getParetoAnalytics(commodityId, Number(year))
  //     .pipe(finalize(() => { this.isLoading = false; }))
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log('Pareto API Response:', res);
  //         if (res && res.success && res.data) {
  //           const data = res.data;

  //           // Extract arrays with multi-key fallback detection
  //           const rawPareto = data.criticalNCByProcessCategory 
  //             || data.criticalNcByProcessCategory 
  //             || data.criticalNC 
  //             || data.criticalCategory 
  //             || data.critical 
  //             || (Array.isArray(data) ? data : []);

  //           const rawStatus = data.importantNCByProcessCategory 
  //             || data.importantNcByProcessCategory 
  //             || data.importantNC 
  //             || data.importantCategory 
  //             || data.important 
  //             || [];

  //           const rawCritical = data.ncByCommodity 
  //             || data.ncByCommodities 
  //             || data.commodityNC 
  //             || data.criticalList 
  //             || data.commodities 
  //             || [];

  //           this.pareto = this.normalizeList(rawPareto);
  //           this.statusList = this.normalizeList(rawStatus);
  //           this.criticalList = this.normalizeList(rawCritical);

  //           this.updateCharts();
  //         } else {
  //           this.initEmptyCharts();
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Failed to load Pareto data', err);
  //         this.initEmptyCharts();
  //       }
  //     });
  // }

  loadParetoData(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    const { commodityId, year } = this.filterForm.value;

    this.analyticsService.getParetoAnalytics(commodityId, Number(year))
      .pipe(finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (res: any) => {
          console.log('Pareto API Response:', res);
          if (res && res.success && res.data) {
            const data = res.data;

            // 🔥 FIX: Mapped exactly to the C# Backend Response Names
            const rawPareto = data.criticalByCategory || [];
            const rawStatus = data.importantByCategory || [];
            const rawCritical = data.criticalAndImportantByCommodity || [];

            this.pareto = this.normalizeList(rawPareto);
            this.statusList = this.normalizeList(rawStatus);
            this.criticalList = this.normalizeList(rawCritical);

            this.updateCharts();
          } else {
            this.initEmptyCharts();
          }
        },
        error: (err) => {
          console.error('Failed to load Pareto data', err);
          this.initEmptyCharts();
        }
      });
  }

  private normalizeList(rawList: any): any[] {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(item => {
      const name = item.name 
        || item.categoryName 
        || item.processCategory 
        || item.commodityName 
        || item.category 
        || item.processCategoryCode 
        || item.code
        || 'Unknown';

      const action = item.action !== undefined && item.action !== null ? Number(item.action)
        : (item.capa !== undefined && item.capa !== null ? Number(item.capa)
        : (item.count !== undefined && item.count !== null ? Number(item.count)
        : (item.capaCount !== undefined && item.capaCount !== null ? Number(item.capaCount)
        : (item.totalCount !== undefined && item.totalCount !== null ? Number(item.totalCount)
        : (item.value !== undefined && item.value !== null ? Number(item.value) : 0)))));

      return { name, action, raw: item };
    });
  }

  private updateCharts(): void {
    this.commodityPieOptions = this.buildPieOptions(this.pareto);
    this.statusPieOptions = this.buildPieOptions(this.statusList);
    this.criticalPieOptions = this.buildPieOptions(this.criticalList);
  }

  // Converts normalized list into Highcharts Pie Series
  private buildPieOptions(dataList: any[]): Highcharts.Options {
    const seriesData = dataList.map((item, index) => ({
      name: item.name,
      y: Number(item.action || 0),
      color: this.pieColors[index % this.pieColors.length]
    })).filter(point => point.y > 0);

    return {
      chart: { 
        type: 'pie', 
        backgroundColor: 'transparent',
        spacing: [10, 10, 10, 10]
      },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        borderColor: 'transparent',
        borderRadius: 8,
        style: { color: '#f8fafc', fontSize: '12px', fontWeight: '500' },
        pointFormat: '<b>{point.name}</b>: <b>{point.y} CAPAs</b> ({point.percentage:.1f}%)',
        shadow: true
      },
      plotOptions: {
        pie: {
          size: '80%',
          center: ['35%', '50%'],
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            connectorWidth: 1,
            distance: 12,
            format: '<b>{point.percentage:.0f}%</b> ({point.y})',
            style: {
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e293b',
              textOutline: 'none'
            }
          },
          showInLegend: true
        }
      },
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        width: 220,
        itemStyle: {
          fontSize: '12px',
          fontWeight: '500',
          color: '#334155',
          textOverflow: 'none'
        },
        itemMarginBottom: 8
      },
      series: [{
        type: 'pie',
        name: 'CAPAs',
        data: seriesData.length > 0 ? seriesData : []
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