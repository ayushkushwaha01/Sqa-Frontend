import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-supplier-dashboard',
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.scss']
})
export class SupplierDashboardComponent implements OnInit {

 
  Highcharts: typeof Highcharts = Highcharts;

  // Mock data for last 5 process audits
  last5ProcessAudits = [
    { auditRef: 'PA-2024-001', score: 85 },
    { auditRef: 'PA-2024-002', score: 78 },
    { auditRef: 'PA-2024-003', score: 92 },
    { auditRef: 'PA-2024-004', score: 88 },
    { auditRef: 'PA-2024-005', score: 95 }
  ];

  // Mock data for last 5 parts audits
  last5PartsAudits = [
    { auditRef: 'PPA-2024-001', score: 80 },
    { auditRef: 'PPA-2024-002', score: 88 },
    { auditRef: 'PPA-2024-003', score: 75 },
    { auditRef: 'PPA-2024-004', score: 90 },
    { auditRef: 'PPA-2024-005', score: 85 }
  ];

  // Base configuration shared across charts
  chartOptionsBase: Highcharts.Options = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: undefined }, // Title handled in HTML
    colors: ['#6b69a6', '#55c898'], // Purple, Green
    xAxis: { 
      categories: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
      lineColor: '#ccc',
      tickColor: 'transparent'
    },
    yAxis: { 
      min: 0, 
      max: 100, 
      tickInterval: 50, 
      title: { text: undefined },
      gridLineColor: '#f0f0f0'
    },
    legend: { 
      layout: 'vertical', 
      align: 'right', 
      verticalAlign: 'middle',
      itemStyle: { fontSize: '11px', color: '#555', fontWeight: 'bold' },
      symbolRadius: 0
    },
    credits: { 
      enabled: true, 
      text: 'CanvasJS.com', 
      position: { align: 'right', verticalAlign: 'bottom', y: -5 },
      style: { color: '#aaa', fontSize: '10px' }
    },
    plotOptions: { 
      column: { pointPadding: 0.1, borderWidth: 0, groupPadding: 0.2 } 
    }
  };

  // 1. Parts Audits Chart - Last 5 Audits with Scores
  partsAuditOptions: Highcharts.Options = {
    ...this.chartOptionsBase,
    xAxis: { 
      categories: this.last5PartsAudits.map(audit => audit.auditRef),
      lineColor: '#ccc',
      tickColor: 'transparent'
    },
    series: [
      { 
        type: 'column', 
        name: 'Score', 
        data: this.last5PartsAudits.map(audit => audit.score),
        color: '#6b69a6' // Purple color for parts audits
      }
    ]
  };

  // 2. Process Audits Chart - Last 5 Audits with Scores
  processAuditOptions: Highcharts.Options = {
    ...this.chartOptionsBase,
    xAxis: { 
      categories: this.last5ProcessAudits.map(audit => audit.auditRef),
      lineColor: '#ccc',
      tickColor: 'transparent'
    },
    series: [
      { 
        type: 'column', 
        name: 'Score', 
        data: this.last5ProcessAudits.map(audit => audit.score),
        color: '#55c898' // Green color for process audits
      }
    ]
  };

  // 3. Monthly Trend Chart
  monthlyTrendOptions: Highcharts.Options = {
    ...this.chartOptionsBase,
    series: [
      { type: 'column', name: 'Process Audits', data: [85, 80, 68, 70] },
      { type: 'column', name: 'Parts Audit', data: [40, 35, 92, 78] }
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }
}