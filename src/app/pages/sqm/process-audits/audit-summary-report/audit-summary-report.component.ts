import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import html2pdf from 'html2pdf.js';
import { ProcessAuditService } from '../process-audit.service';

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-audit-summary-report',
  templateUrl: './audit-summary-report.component.html',
  styleUrls: ['./audit-summary-report.component.scss']
})
export class AuditSummaryReportComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts;

  reportData: any = null;
  ratingChartOptions: Highcharts.Options = {};
  sodGaugeOptions: Highcharts.Options = {};
  spiderChartOptions: Highcharts.Options = {};
  loading = true;
  generatingPdf = false;

  private ringColors = ['#0284c7', '#9333ea', '#0d9488', '#d97706', '#16a34a', '#dc2626', '#4f46e5', '#0891b2'];
  getRingColor(i: number): string {
    return this.ringColors[i % this.ringColors.length];
  }

  getRatingColorByName(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('5') || n.includes('excellent')) return '#16a34a';
    if (n.includes('4') || n.includes('good')) return '#65a30d';
    if (n.includes('3') || n.includes('satisfactory')) return '#d97706';
    if (n.includes('2') || n.includes('minor')) return '#ea580c';
    if (n.includes('1') || n.includes('major')) return '#dc2626';
    return '#94a3b8';
  }

  constructor(
    private route: ActivatedRoute,
    private auditService: ProcessAuditService
  ) {}

  ngOnInit(): void {
    const auditId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (auditId) {
      this.loadReport(auditId);
    }
  }

  loadReport(auditId: number): void {
    this.loading = true;
    this.auditService.getAuditSummaryReport(auditId).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.reportData = res.data;
          this.initCharts();
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // initCharts(): void {
  //   // 1. FINDING DISTRIBUTION DONUT CHART
  //   const rawDist = (this.reportData.ratingDistribution || []) as any[];
  //   let pieSeriesData = rawDist.map((item: any) => {
  //     const name = item.name || 'Rating';
  //     const y = item.y !== undefined ? item.y : (item.count !== undefined ? item.count : 1);
  //     return { name, y, color: this.getRatingColorByName(name) };
  //   });

  //   if (pieSeriesData.length === 0) {
  //     pieSeriesData = [
  //       { name: 'Rating 5 (Excellent)', y: 1, color: '#16a34a' }
  //     ];
  //   }

  //   this.ratingChartOptions = {
  //     chart: { type: 'pie', backgroundColor: 'transparent', height: 155, animation: false, margin: [0, 0, 0, 0] },
  //     title: { text: '' },
  //     credits: { enabled: false },
  //     tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})' },
  //     legend: {
  //       enabled: true,
  //       layout: 'vertical',
  //       align: 'right',
  //       verticalAlign: 'middle',
  //       itemStyle: { fontSize: '9px', fontWeight: '600', color: '#334155' },
  //       symbolHeight: 8,
  //       symbolWidth: 8,
  //       symbolRadius: 4,
  //       margin: 2
  //     },
  //     plotOptions: {
  //       pie: {
  //         innerSize: '55%',
  //         size: '85%',
  //         animation: false,
  //         showInLegend: true,
  //         dataLabels: {
  //           enabled: true,
  //           distance: 4,
  //           format: '{point.percentage:.0f}%',
  //           style: { fontSize: '9px', fontWeight: '700', color: '#1e293b', textOutline: 'none' }
  //         }
  //       }
  //     },
  //     series: [{ type: 'pie', name: 'Ratings', data: pieSeriesData }]
  //   };

  //   // 2. SOD RISK SCORE GAUGE
  //   const sodScore = this.reportData.sodRiskScore || 0;
  //   this.sodGaugeOptions = {
  //     chart: { type: 'solidgauge', backgroundColor: 'transparent', height: 155, margin: [0, 0, 0, 0], animation: false },
  //     title: { text: '' },
  //     credits: { enabled: false },
  //     pane: {
  //       center: ['50%', '75%'],
  //       size: '125%',
  //       startAngle: -90,
  //       endAngle: 90,
  //       background: [{
  //         backgroundColor: '#e2e8f0',
  //         innerRadius: '60%',
  //         outerRadius: '100%',
  //         shape: 'arc'
  //       }] as any
  //     },
  //     tooltip: { enabled: false },
  //     yAxis: {
  //       min: 0,
  //       max: 1000,
  //       stops: [
  //         [0.3, '#16a34a'], // Green
  //         [0.6, '#eab308'], // Yellow
  //         [0.9, '#dc2626']  // Red
  //       ],
  //       lineWidth: 0,
  //       tickWidth: 0,
  //       minorTickInterval: null,
  //       tickAmount: 2,
  //       labels: { y: 14, style: { fontSize: '9px' } }
  //     },
  //     plotOptions: {
  //       solidgauge: {
  //         animation: false,
  //         dataLabels: {
  //           y: -28,
  //           borderWidth: 0,
  //           useHTML: true,
  //           format: '<div style="text-align:center"><span style="font-size:18px;color:#0f172a;font-weight:bold">{y}</span><br/><span style="font-size:9px;color:#64748b">Risk Score</span></div>'
  //         }
  //       }
  //     },
  //     series: [{
  //       type: 'solidgauge',
  //       name: 'SOD Score',
  //       data: [sodScore],
  //       innerRadius: '60%',
  //       radius: '100%'
  //     }]
  //   };

  //   // 3. RADAR / SPIDER CHART
  //   const cats = (this.reportData.categoryScores || []) as any[];
  //   const catNames = cats.length > 0 ? cats.map((c: any) => c.categoryName) : ['QMS', 'MM', 'PPC', 'IMC', '5S'];
  //   const catScores = cats.length > 0 ? cats.map((c: any) => c.percentage) : [0, 0, 0, 0, 0];

  //   this.spiderChartOptions = {
  //     chart: {
  //       polar: true,
  //       type: 'line',
  //       backgroundColor: 'transparent',
  //       height: 155,
  //       animation: false,
  //       margin: [10, 10, 20, 10]
  //     },
  //     title: { text: '' },
  //     credits: { enabled: false },
  //     legend: {
  //       enabled: true,
  //       align: 'center',
  //       verticalAlign: 'bottom',
  //       itemStyle: { fontSize: '8.5px', fontWeight: '600', color: '#334155' },
  //       symbolHeight: 8,
  //       symbolWidth: 14,
  //       y: 8
  //     },
  //     xAxis: {
  //       categories: catNames,
  //       tickmarkPlacement: 'on',
  //       lineWidth: 0,
  //       labels: { style: { fontSize: '8px', fontWeight: '600', color: '#334155' } }
  //     },
  //     yAxis: {
  //       gridLineInterpolation: 'polygon',
  //       lineWidth: 0,
  //       min: 0,
  //       max: 100,
  //       labels: { enabled: false }
  //     },
  //     tooltip: { shared: true, pointFormat: '<b>{point.y}%</b>' },
  //     series: [
  //       {
  //         type: 'area',
  //         name: 'Benchmark',
  //         data: catNames.map(() => 75),
  //         color: 'rgba(2,132,199,0.15)',
  //         lineColor: '#0284c7',
  //         lineWidth: 1.5,
  //         pointPlacement: 'on',
  //         marker: { enabled: false }
  //       } as any,
  //       {
  //         type: 'line',
  //         name: 'Actual',
  //         data: catScores,
  //         color: '#d97706',
  //         pointPlacement: 'on',
  //         lineWidth: 2,
  //         marker: { radius: 3, fillColor: '#d97706' }
  //       } as any
  //     ]
  //   };
  // }

  initCharts(): void {
    // 1. FINDING DISTRIBUTION DONUT CHART
    const rawDist = (this.reportData.ratingDistribution || []) as any[];
    let pieSeriesData = rawDist.map((item: any) => {
      const name = item.name || 'Rating';
      const y = item.y !== undefined ? item.y : (item.count !== undefined ? item.count : 1);
      return { name, y, color: this.getRatingColorByName(name) };
    });

    if (pieSeriesData.length === 0) {
      pieSeriesData = [
        { name: 'Rating 5 (Excellent)', y: 1, color: '#16a34a' }
      ];
    }

    this.ratingChartOptions = {
      chart: { type: 'pie', backgroundColor: 'transparent', height: 155, animation: false, margin: [0, 0, 0, 0] },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})' },
      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        itemStyle: { fontSize: '9px', fontWeight: '600', color: '#334155' },
        symbolHeight: 8,
        symbolWidth: 8,
        symbolRadius: 4,
        margin: 2
      },
      plotOptions: {
        pie: {
          innerSize: '55%',
          size: '85%',
          animation: false,
          showInLegend: true,
          dataLabels: {
            enabled: true,
            distance: 4,
            format: '{point.percentage:.0f}%',
            style: { fontSize: '9px', fontWeight: '700', color: '#1e293b', textOutline: 'none' }
          }
        }
      },
      series: [{ type: 'pie', name: 'Ratings', data: pieSeriesData }]
    };

    // 2. SOD RISK SCORE GAUGE
    const sodScore = this.reportData.sodRiskScore || 0;
    this.sodGaugeOptions = {
      chart: { type: 'solidgauge', backgroundColor: 'transparent', height: 155, margin: [0, 0, 0, 0], animation: false },
      title: { text: '' },
      credits: { enabled: false },
      pane: {
        center: ['50%', '75%'],
        size: '125%',
        startAngle: -90,
        endAngle: 90,
        background: [{
          backgroundColor: '#e2e8f0',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }] as any
      },
      tooltip: { enabled: false },
      yAxis: {
        min: 0,
        max: 1000,
        stops: [
          [0.3, '#16a34a'], // Green
          [0.6, '#eab308'], // Yellow
          [0.9, '#dc2626']  // Red
        ],
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        labels: { y: 14, style: { fontSize: '9px' } }
      },
      plotOptions: {
        solidgauge: {
          animation: false,
          dataLabels: {
            y: -28,
            borderWidth: 0,
            useHTML: true,
            format: '<div style="text-align:center"><span style="font-size:18px;color:#0f172a;font-weight:bold">{y}</span><br/><span style="font-size:9px;color:#64748b">Risk Score</span></div>'
          }
        }
      },
      series: [{
        type: 'solidgauge',
        name: 'SOD Score',
        data: [sodScore],
        innerRadius: '60%',
        radius: '100%'
      }]
    };

    // 🔥 3. SPIDER / RADAR CHART (Outer: Categories | Inner Nets: Severity Avg, Occurrence Avg, Detection Avg)
    const cats = (this.reportData.categoryScores || []) as any[];
    const catNames = cats.length > 0 ? cats.map((c: any) => c.categoryName) : ['QMS', 'MM', 'PPC', 'IMC', '5S'];
    const sevData  = cats.length > 0 ? cats.map((c: any) => c.avgSeverity || 0) : [0, 0, 0, 0, 0];
    const occData  = cats.length > 0 ? cats.map((c: any) => c.avgOccurrence || 0) : [0, 0, 0, 0, 0];
    const detData  = cats.length > 0 ? cats.map((c: any) => c.avgDetection || 0) : [0, 0, 0, 0, 0];

    this.spiderChartOptions = {
      chart: {
        polar: true,
        type: 'line',
        backgroundColor: 'transparent',
        height: 155,
        animation: false,
        margin: [10, 10, 22, 10]
      },
      title: { text: '' },
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '8px', fontWeight: '600', color: '#334155' },
        symbolHeight: 6,
        symbolWidth: 10,
        y: 10,
        margin: 0
      },
      xAxis: {
        categories: catNames,
        tickmarkPlacement: 'on',
        lineWidth: 0,
        labels: { style: { fontSize: '7.5px', fontWeight: '700', color: '#334155' } }
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 10, // Severity, Occurrence, Detection are rated on a 1-10 scale
        labels: { enabled: false }
      },
      tooltip: { shared: true, pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>' },
      series: [
        {
          type: 'line',
          name: 'Severity (Avg)',
          data: sevData,
          color: '#dc2626', // Red
          pointPlacement: 'on',
          lineWidth: 1.8,
          marker: { radius: 2.5, fillColor: '#dc2626' }
        } as any,
        {
          type: 'line',
          name: 'Occurrence (Avg)',
          data: occData,
          color: '#d97706', // Amber/Orange
          pointPlacement: 'on',
          lineWidth: 1.8,
          marker: { radius: 2.5, fillColor: '#d97706' }
        } as any,
        {
          type: 'line',
          name: 'Detection (Avg)',
          data: detData,
          color: '#0284c7', // Blue/Teal
          pointPlacement: 'on',
          lineWidth: 1.8,
          marker: { radius: 2.5, fillColor: '#0284c7' }
        } as any
      ]
    };
  }

  // --- HELPER LOGIC FOR NC STATUS & VERDICTS ---
  getNcPercentage(value: number | undefined): number {
    const total = this.reportData?.ncStatus?.totalNC || 0;
    if (!total || !value) return 0;
    return Math.round((value / total) * 100);
  }

  getVerdictClass(): string {
    const sod = this.reportData?.sodRiskScore || 0;
    if (sod >= 400) return 'poor';
    if (sod >= 200) return 'average';
    return 'good';
  }

  getVerdictTitle(): string {
    const sod = this.reportData?.sodRiskScore || 0;
    if (sod >= 400) return 'POOR SUPPLIER';
    if (sod >= 200) return 'AVERAGE SUPPLIER';
    return 'GOOD SUPPLIER';
  }

  getVerdictSubtitle(): string {
    const sod = this.reportData?.sodRiskScore || 0;
    if (sod >= 400) return 'ADDRESS ALL MAJOR NCs IMMEDIATELY';
    if (sod >= 200) return 'MONITOR PROCESS DEVIATIONS';
    return 'STANDARD AUDIT COMPLIANCE MET';
  }

  isScoreLow(): boolean {
    const raw = this.reportData?.header?.overallScore || '0%';
    const numeric = parseInt(raw.replace('%', ''), 10) || 0;
    return numeric < 60;
  }

  isRiskHigh(): boolean {
    return (this.reportData?.sodRiskScore || 0) >= 300;
  }

  // --- PDF GENERATION LOGIC ---
  openPdfInNewTab(): void {
    const el = document.getElementById('pdf-report-content');
    if (!el) return;
    this.generatingPdf = true;
    (html2pdf as any)().set(this.getPdfOpt()).from(el).outputPdf('bloburl').then((url: string) => {
      window.open(url, '_blank');
      this.generatingPdf = false;
    }).catch(() => { this.generatingPdf = false; });
  }

  downloadPdf(): void {
    const el = document.getElementById('pdf-report-content');
    if (!el) return;
    this.generatingPdf = true;
    (html2pdf as any)().set(this.getPdfOpt()).from(el).save().then(() => {
      this.generatingPdf = false;
    }).catch(() => { this.generatingPdf = false; });
  }

  private getPdfOpt() {
    const ref = (this.reportData?.header?.auditReference || 'Report').replace(/[\\/]/g, '_');
    return {
      margin: 0.2,
      filename: 'Audit_Summary_Report_' + ref + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };
  }
}